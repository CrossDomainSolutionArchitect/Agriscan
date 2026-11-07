from __future__ import annotations

import os
import re
import tempfile
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Any

import jwt
import requests
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from gradio_client import Client
from jwt import PyJWKClient
from starlette.concurrency import run_in_threadpool

APP_NAME = "AgriScan API"
API_VERSION = "1.0.0"
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
SUPPORTED_CROPS = {"maize", "tomato", "potato"}

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "").rstrip("/")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "")
CLERK_AUTHORIZED_PARTIES = {
    item.strip().rstrip("/")
    for item in os.getenv("CLERK_AUTHORIZED_PARTIES", "").split(",")
    if item.strip()
}
HF_INFERENCE_SPACE_ID = os.getenv("HF_INFERENCE_SPACE_ID", "").strip()
HF_TOKEN = os.getenv("HF_TOKEN", "").strip() or None
MODEL_VERSION = os.getenv("MODEL_VERSION", "agriscan-inference-v1")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SECRET_KEY are required.")
if not CLERK_ISSUER:
    raise RuntimeError("CLERK_ISSUER is required.")
if not HF_INFERENCE_SPACE_ID:
    raise RuntimeError("HF_INFERENCE_SPACE_ID is required.")

if not CLERK_JWKS_URL:
    CLERK_JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

app = FastAPI(
    title=APP_NAME,
    version=API_VERSION,
    description="Authenticated application API for AgriScan crop diagnosis.",
)

allowed_origins = [
    item.strip().rstrip("/")
    for item in os.getenv("ALLOWED_ORIGINS", "https://agri-scan.co.za").split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

bearer_scheme = HTTPBearer(auto_error=False)


class CropType(str, Enum):
    maize = "maize"
    tomato = "tomato"
    potato = "potato"


@lru_cache(maxsize=1)
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(CLERK_JWKS_URL, cache_keys=True)


def verify_clerk_token(token: str) -> dict[str, Any]:
    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"require": ["exp", "iat", "sub"]},
            leeway=30,
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired Clerk session.") from exc

    if not isinstance(claims.get("sub"), str) or not claims["sub"]:
        raise HTTPException(status_code=401, detail="The Clerk token has no valid subject.")

    if CLERK_AUTHORIZED_PARTIES:
        azp = claims.get("azp")
        if not isinstance(azp, str) or azp.rstrip("/") not in CLERK_AUTHORIZED_PARTIES:
            raise HTTPException(status_code=401, detail="The session was not issued for an allowed application.")

    return claims


def current_clerk_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="A Clerk bearer token is required.")
    return verify_clerk_token(credentials.credentials)


def supabase_request(
    method: str,
    table_path: str,
    *,
    params: dict[str, str] | None = None,
    payload: dict[str, Any] | None = None,
    prefer: str | None = None,
) -> Any:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    try:
        response = requests.request(
            method,
            f"{SUPABASE_URL}/rest/v1/{table_path}",
            headers=headers,
            params=params,
            json=payload,
            timeout=25,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="The database service is temporarily unavailable.") from exc

    if not response.ok:
        # Do not return database response bodies; they can contain schema details.
        raise HTTPException(status_code=502, detail="The database request could not be completed.")
    if response.status_code == 204 or not response.content:
        return None
    return response.json()


def get_or_create_farmer(clerk_user_id: str) -> dict[str, Any]:
    rows = supabase_request(
        "POST",
        "farmer_profiles",
        params={"on_conflict": "clerk_user_id"},
        payload={"clerk_user_id": clerk_user_id},
        prefer="resolution=merge-duplicates,return=representation",
    )
    if not rows:
        raise HTTPException(status_code=502, detail="Could not initialise the farmer profile.")
    return rows[0]


def get_inference_client() -> Client:
    # One Gradio client is reused for warm requests in this Space container.
    if not hasattr(get_inference_client, "_client"):
        try:
            get_inference_client._client = Client(HF_INFERENCE_SPACE_ID, hf_token=HF_TOKEN)
        except Exception as exc:
            raise HTTPException(status_code=503, detail="The AgriScan inference service is unavailable.") from exc
    return get_inference_client._client


def parse_model_output(output: Any) -> tuple[str | None, float | None, list[dict[str, Any]], str]:
    raw = output if isinstance(output, str) else str(output)
    predictions: list[dict[str, Any]] = []

    patterns = [
        re.compile(r"\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*\*\*([\d.]+)%?\*\*\s*\|"),
        re.compile(r"\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|"),
    ]
    for pattern in patterns:
        for match in pattern.finditer(raw):
            try:
                confidence = float(match.group(2)) / 100
            except ValueError:
                continue
            if 0 <= confidence <= 1:
                predictions.append({"label": match.group(1).strip(), "confidence": confidence})
        if predictions:
            break

    top_label = predictions[0]["label"] if predictions else None
    if not top_label:
        match = re.search(r"Top-1 Label:\s*`([^`]+)`", raw)
        if match:
            top_label = match.group(1).strip()

    top_confidence = predictions[0]["confidence"] if predictions else None
    return top_label, top_confidence, predictions, raw


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": API_VERSION,
        "inference_space": HF_INFERENCE_SPACE_ID,
    }


@app.get("/api/v1/me")
async def get_my_profile(claims: dict[str, Any] = Depends(current_clerk_claims)) -> dict[str, Any]:
    profile = await run_in_threadpool(get_or_create_farmer, claims["sub"])
    return {
        "id": profile["id"],
        "clerk_user_id": profile["clerk_user_id"],
        "first_name": profile.get("first_name"),
        "last_name": profile.get("last_name"),
        "preferred_language": profile.get("preferred_language", "en"),
    }


@app.post("/api/v1/diagnoses")
async def create_diagnosis(
    image: UploadFile = File(...),
    crop_type: CropType = Form(...),
    claims: dict[str, Any] = Depends(current_clerk_claims),
) -> dict[str, Any]:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG or WEBP image.")

    content = await image.read(MAX_UPLOAD_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="The image exceeds the 10 MB upload limit.")

    suffix = Path(image.filename or "upload.jpg").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[image.content_type]

    profile = await run_in_threadpool(get_or_create_farmer, claims["sub"])

    temp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        client = await run_in_threadpool(get_inference_client)
        inference_result = await run_in_threadpool(
            lambda: client.predict(image=temp_path, api_name="/predict")
        )
        if isinstance(inference_result, (tuple, list)):
            model_output = inference_result[0] if inference_result else ""
        elif isinstance(inference_result, dict) and "data" in inference_result:
            data = inference_result.get("data") or []
            model_output = data[0] if data else ""
        else:
            model_output = inference_result

        disease_name, confidence, confidences, raw_output = parse_model_output(model_output)
        status = "completed" if disease_name else "review_required"

        saved_rows = await run_in_threadpool(
            lambda: supabase_request(
                "POST",
                "diagnoses",
                payload={
                    "farmer_id": profile["id"],
                    "crop_type": crop_type.value,
                    "disease_name": disease_name,
                    "confidence": confidence,
                    "model_version": MODEL_VERSION,
                    "status": status,
                },
                prefer="return=representation",
            )
        )
        if not saved_rows:
            raise HTTPException(status_code=502, detail="The diagnosis was generated but could not be saved.")

        saved = saved_rows[0]
        return {
            "diagnosis_id": saved["id"],
            "diagnosis": disease_name,
            "top_confidence": confidence or 0,
            "confidences": confidences,
            "raw_output": raw_output,
            "status": saved["status"],
            "created_at": saved["created_at"],
            "recommendation_threshold": 0.6,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Image analysis failed. Please try again.") from exc
    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass


@app.get("/api/v1/diagnoses")
async def list_my_diagnoses(
    limit: int = Query(default=20, ge=1, le=100),
    claims: dict[str, Any] = Depends(current_clerk_claims),
) -> list[dict[str, Any]]:
    profile = await run_in_threadpool(get_or_create_farmer, claims["sub"])
    rows = await run_in_threadpool(
        lambda: supabase_request(
            "GET",
            "diagnoses",
            params={
                "select": "id,crop_type,disease_name,confidence,treatment_advice,model_version,status,created_at",
                "farmer_id": f"eq.{profile['id']}",
                "order": "created_at.desc",
                "limit": str(limit),
            },
        )
    )
    return rows or []
