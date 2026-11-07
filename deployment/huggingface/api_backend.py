"""API adapter for the existing AgriScan Gradio inference pipeline.

This module deliberately does not load ML models. It receives the existing
predict_image callable from app.py so both Gradio and REST use the same models.
"""
from __future__ import annotations

import os
import base64
import re
from io import BytesIO
from typing import Any

import httpx
import jwt
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from jwt import PyJWKClient
from PIL import Image, UnidentifiedImageError


SUPPORTED_CROPS = {"maize", "potato", "tomato"}
MODEL_VERSION = os.getenv("AGRISCAN_MODEL_VERSION", "yolo11n-efficientnetb0-v1")
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(8 * 1024 * 1024)))


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise HTTPException(status_code=503, detail=f"Server configuration is missing {name}.")
    return value


def _jwks_client() -> PyJWKClient:
    issuer = _required_env("CLERK_ISSUER").rstrip("/")
    jwks_url = os.getenv("CLERK_JWKS_URL", f"{issuer}/.well-known/jwks.json").strip()
    return PyJWKClient(jwks_url, cache_keys=True, timeout=10)


def _verify_clerk_token(authorization: str | None) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="A Clerk bearer token is required.")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="The bearer token is empty.")
    try:
        issuer = _required_env("CLERK_ISSUER").rstrip("/")
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False, "require": ["exp", "iat", "iss", "sub"]},
        )
        allowed_parties = [x.strip() for x in os.getenv("CLERK_AUTHORIZED_PARTIES", "").split(",") if x.strip()]
        azp = claims.get("azp")
        if allowed_parties and azp and azp not in allowed_parties:
            raise HTTPException(status_code=401, detail="Token was issued for an unapproved application origin.")
        if not isinstance(claims.get("sub"), str) or not claims["sub"].strip():
            raise HTTPException(status_code=401, detail="The token does not contain a valid user subject.")
        return claims
    except HTTPException:
        raise
    except Exception as exc:
        # Do not return token contents or cryptographic details to the client.
        print(f"Clerk token verification failed: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=401, detail="The Clerk session token is invalid or expired.") from exc


def _supabase_request(method: str, table_path: str, *, params: dict | None = None, payload: Any = None, prefer: str | None = None):
    base_url = _required_env("SUPABASE_URL").rstrip("/")
    api_key = os.getenv("SUPABASE_SECRET_KEY", "").strip() or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="Server configuration is missing SUPABASE_SECRET_KEY.")
    headers = {"apikey": api_key, "Accept": "application/json"}
    # Legacy service-role keys are JWTs. New sb_secret_ keys are API keys, not JWTs.
    if api_key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {api_key}"
    if prefer:
        headers["Prefer"] = prefer
    try:
        response = httpx.request(
            method,
            f"{base_url}/rest/v1/{table_path.lstrip('/')}",
            headers=headers,
            params=params,
            json=payload,
            timeout=20.0,
        )
    except httpx.HTTPError as exc:
        print(f"Supabase connection failed: {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=502, detail="The database service is temporarily unavailable.") from exc
    if response.status_code >= 400:
        print(f"Supabase {method} {table_path} returned {response.status_code}: {response.text[:1000]}")
        raise HTTPException(status_code=502, detail="The database rejected the request. Check server logs and table schema.")
    if not response.content:
        return []
    try:
        return response.json()
    except ValueError:
        return []


def _upsert_farmer(claims: dict[str, Any]) -> dict[str, Any]:
    payload: dict[str, Any] = {"clerk_user_id": claims["sub"]}
    # Only copy profile fields when they are present in the verified Clerk JWT.
    claim_to_column = {
        "first_name": "first_name",
        "last_name": "last_name",
        "username": "username",
        "email": "email_address",
        "email_address": "email_address",
        "phone_number": "phone",
        "province": "province",
        "district": "district",
        "preferred_language": "preferred_language",
    }
    for claim_name, column_name in claim_to_column.items():
        value = claims.get(claim_name)
        if isinstance(value, str) and value.strip():
            payload[column_name] = value.strip()
    rows = _supabase_request(
        "POST",
        "farmer_profiles",
        params={"on_conflict": "clerk_user_id", "select": "id,clerk_user_id,first_name,last_name,username,email_address,phone,province,district,preferred_language,created_at"},
        payload=payload,
        prefer="resolution=merge-duplicates,return=representation",
    )
    if not rows:
        raise HTTPException(status_code=502, detail="Could not create or retrieve the farmer profile.")
    return rows[0]


def _crop_label(value: str) -> str:
    value = value.strip().lower()
    aliases = {"maize": "maize", "corn": "maize", "corn_(maize)": "maize", "potato": "potato", "tomato": "tomato"}
    return aliases.get(value, value)


def _prediction_summary(result: tuple) -> dict[str, Any]:
    if not isinstance(result, (tuple, list)) or len(result) != 4:
        raise HTTPException(status_code=500, detail="The existing AgriScan pipeline returned an unexpected result.")
    crop_scores, disease_scores, annotated_image, details = result
    if not crop_scores or not disease_scores:
        message = str(details or "No supported leaf was detected.")
        raise HTTPException(status_code=422, detail=message[:500])
    predicted_crop_label = max(crop_scores, key=crop_scores.get)
    disease_label = max(disease_scores, key=disease_scores.get)
    crop = _crop_label(str(predicted_crop_label))
    parts = str(disease_label).split("___", 1)
    disease_name = parts[1].replace("_", " ").strip() if len(parts) == 2 else str(disease_label)
    disease_name = disease_name.replace("  ", " ")
    confidence = float(disease_scores[disease_label])
    if crop not in SUPPORTED_CROPS or not 0 <= confidence <= 1:
        raise HTTPException(status_code=500, detail="The model returned an invalid crop or confidence value.")
    details_text = str(details or "")
    detected_match = re.search(
        r"YOLO11n detected crop:\*\*\s*([^\r\n]+)",
        details_text,
        re.IGNORECASE,
    )
    detection_confidence_match = re.search(
        r"Leaf detection confidence:\*\*\s*([0-9]+(?:\.[0-9]+)?)\s*%",
        details_text,
        re.IGNORECASE,
    )
    detected_crop = _crop_label(detected_match.group(1).strip()) if detected_match else None
    detection_confidence = (
        float(detection_confidence_match.group(1)) / 100.0
        if detection_confidence_match else None
    )

    annotated_image_data_url = None
    if annotated_image is not None:
        try:
            image = annotated_image.convert("RGB")
            image.thumbnail((1280, 1280))
            image_buffer = BytesIO()
            image.save(image_buffer, format="JPEG", quality=82, optimize=True)
            image_base64 = base64.b64encode(image_buffer.getvalue()).decode("ascii")
            annotated_image_data_url = "data:image/jpeg;base64," + image_base64
        except Exception as exc:
            print(f"Could not encode YOLO annotation image: {type(exc).__name__}: {exc}")

    warning = "warning" in details_text.lower()
    return {
        "predicted_crop": crop,
        "disease_name": disease_name,
        "confidence": confidence,
        "detected_crop": detected_crop,
        "detection_confidence": detection_confidence,
        "annotated_image_data_url": annotated_image_data_url,
        "crop_predictions": {str(k): float(v) for k, v in crop_scores.items()},
        "disease_predictions": {str(k): float(v) for k, v in disease_scores.items()},
        "details": details_text,
        "review_required": warning,
    }


def create_api_app(gradio_demo, predict_image):
    api = FastAPI(
        title="AgriScan API",
        version="1.0.0",
        description="REST API mounted alongside the existing AgriScan Gradio interface.",
    )
    origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "").split(",") if x.strip()]
    if origins:
        api.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["Authorization", "Content-Type"],
        )

    def current_claims(authorization: str | None = Header(default=None)):
        return _verify_clerk_token(authorization)

    @api.get("/health")
    def health():
        return {"status": "ok", "service": "agriscan", "model_version": MODEL_VERSION}

    @api.get("/api/v1/me")
    def get_me(claims: dict = Depends(current_claims)):
        profile = _upsert_farmer(claims)
        return {"farmer": profile}

    @api.post("/api/v1/diagnoses")
    def create_diagnosis(
        image: UploadFile = File(...),
        crop_type: str = Form(...),
        personal_data_consent: bool = Form(...),
        claims: dict = Depends(current_claims),
    ):
        if not personal_data_consent:
            raise HTTPException(status_code=400, detail="Consent to personal-data processing is required before a diagnosis can be saved.")
        requested_crop = _crop_label(crop_type)
        if requested_crop not in SUPPORTED_CROPS:
            raise HTTPException(status_code=422, detail="crop_type must be maize, potato or tomato.")
        raw = image.file.read(MAX_IMAGE_BYTES + 1)
        if not raw:
            raise HTTPException(status_code=400, detail="The uploaded image is empty.")
        if len(raw) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail=f"Image exceeds the {MAX_IMAGE_BYTES // (1024 * 1024)} MB upload limit.")
        try:
            from io import BytesIO
            pil_image = Image.open(BytesIO(raw)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise HTTPException(status_code=415, detail="Upload a valid JPEG, PNG or WebP image.") from exc

        prediction = _prediction_summary(predict_image(pil_image))
        profile = _upsert_farmer(claims)
        mismatch = prediction["predicted_crop"] != requested_crop
        status = "review_required" if mismatch or prediction["review_required"] else "completed"
        active_consents = _supabase_request(
            "GET",
            "consent_records",
            params={
                "select": "id",
                "farmer_id": f"eq.{profile['id']}",
                "consent_type": "eq.personal_data_processing",
                "withdrawn_at": "is.null",
                "limit": "1",
            },
        )
        if not active_consents:
            _supabase_request(
                "POST",
                "consent_records",
                payload={
                    "farmer_id": profile["id"],
                    "consent_type": "personal_data_processing",
                    "policy_version": os.getenv("CONSENT_POLICY_VERSION", "v1"),
                },
                prefer="return=minimal",
            )
        rows = _supabase_request(
            "POST",
            "diagnoses",
            params={"select": "id,farmer_id,crop_type,disease_name,confidence,treatment_advice,model_version,status,created_at"},
            payload={
                "farmer_id": profile["id"],
                "crop_type": requested_crop,
                "disease_name": prediction["disease_name"],
                "confidence": prediction["confidence"],
                "treatment_advice": None,
                "model_version": MODEL_VERSION,
                "status": status,
            },
            prefer="return=representation",
        )
        if not rows:
            raise HTTPException(status_code=502, detail="The diagnosis was not returned after saving.")
        return {
            "diagnosis": rows[0],
            "prediction": {
                "predicted_crop": prediction["predicted_crop"],
                "requested_crop": requested_crop,
                "leaf_detection": {
                    "model": "YOLO11n",
                    "detected": True,
                    "crop": prediction["detected_crop"],
                    "confidence": prediction["detection_confidence"],
                    "annotated_image": prediction["annotated_image_data_url"],
                },
                "crop_classifier": {
                    "model": "EfficientNetB0",
                    "top_predictions": [
                        {"label": str(label), "confidence": float(score)}
                        for label, score in list(prediction["crop_predictions"].items())[:3]
                    ],
                },
                "disease_classifier": {
                    "model": "EfficientNetB0",
                    "top_predictions": [
                        {"label": str(label), "confidence": float(score)}
                        for label, score in list(prediction["disease_predictions"].items())[:5]
                    ],
                },
                "crop_predictions": prediction["crop_predictions"],
                "disease_predictions": prediction["disease_predictions"],
                "details": prediction["details"],
            },
            "image_stored": False,
            "note": "The uploaded image was processed in memory and was not stored.",
        }

    @api.get("/api/v1/diagnoses")
    def list_diagnoses(limit: int = Query(default=20, ge=1, le=50), claims: dict = Depends(current_claims)):
        profile = _upsert_farmer(claims)
        rows = _supabase_request(
            "GET",
            "diagnoses",
            params={
                "select": "id,crop_type,disease_name,confidence,treatment_advice,model_version,status,created_at",
                "farmer_id": f"eq.{profile['id']}",
                "order": "created_at.desc",
                "limit": str(limit),
            },
        )
        return {"items": rows, "count": len(rows)}

    return api


def mount_api_with_gradio(gradio_demo, predict_image, gradio_module):
    """Return the single ASGI app served by Uvicorn on the Space's port."""
    api = create_api_app(gradio_demo, predict_image)
    return gradio_module.mount_gradio_app(api, gradio_demo, path="/")