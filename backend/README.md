---
title: AgriScan API
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# AgriScan FastAPI backend

This is a separate, authenticated application API for AgriScan. It does not replace the existing Gradio inference Space or retrain the models.

## Responsibilities

- Verify Clerk session JWTs using the Clerk issuer and JWKS.
- Resolve the authenticated Clerk subject to `farmer_profiles.clerk_user_id`.
- Call the existing Gradio inference Space.
- Persist diagnosis metadata in Supabase.
- Return only the authenticated farmer's diagnosis history.

Uploaded images are written to a temporary file for inference and deleted after the request. Image bytes are not stored in Supabase.

## Hugging Face Space secrets

Configure these in the Space **Settings → Variables and secrets** page. Use secrets for all credentials.

| Name | Type | Purpose |
|---|---|---|
| `SUPABASE_URL` | Variable | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Secret | Supabase secret key; use legacy service-role key only if that is what the project exposes |
| `CLERK_ISSUER` | Variable | Exact Clerk JWT issuer URL for the production instance |
| `CLERK_JWKS_URL` | Variable | Clerk JWKS URL; if omitted, derived from issuer |
| `CLERK_AUTHORIZED_PARTIES` | Variable | Comma-separated allowed frontend origins |
| `HF_INFERENCE_SPACE_ID` | Variable | Exact existing inference Space ID, e.g. `owner/space-name` |
| `HF_TOKEN` | Secret | Only if the inference Space is private or gated |
| `ALLOWED_ORIGINS` | Variable | Comma-separated browser origins allowed by CORS |
| `MODEL_VERSION` | Variable | Optional model/deployment identifier |

Example values (replace with your real values):

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
CLERK_ISSUER=https://YOUR_CLERK_INSTANCE.clerk.accounts.dev
CLERK_JWKS_URL=https://YOUR_CLERK_INSTANCE.clerk.accounts.dev/.well-known/jwks.json
CLERK_AUTHORIZED_PARTIES=https://agri-scan.co.za
HF_INFERENCE_SPACE_ID=Vernard/agriscan-ai-demo
ALLOWED_ORIGINS=https://agri-scan.co.za
MODEL_VERSION=agriscan-inference-v1
```

Do not commit real credentials. Do not put the Supabase secret key, Clerk secret key, or HF token in React/Vite variables.

## Deploy as a new Docker Space

Create a **new** Hugging Face Space with the Docker SDK. Keep the existing model/inference Space unchanged.

Copy the contents of this `backend/` directory into the root of the new Space repository so that `README.md`, `Dockerfile`, `requirements.txt`, and `app/` are at the Space root. Add the Space variables and secrets listed above, then allow the Space to build.

The Space health endpoint is:

```text
https://YOUR-SPACE-NAME.hf.space/health
```

## API

All routes except `/health` require:

```http
Authorization: Bearer <Clerk session JWT>
```

- `GET /health` — liveness check.
- `GET /api/v1/me` — create/retrieve the signed-in farmer profile.
- `POST /api/v1/diagnoses` — multipart fields `image` and `crop_type`.
- `GET /api/v1/diagnoses?limit=20` — diagnosis history for the signed-in farmer.

Supported crop values currently match the database constraint: `maize`, `tomato`, and `potato`. Citrus is displayed in the current frontend but is not permitted by the current `diagnoses.crop_type` database constraint; do not submit citrus until the model and database scope are reconciled.

## Security model

The backend verifies the Clerk JWT signature, issuer, expiry, subject, and (when configured) authorized party. It never accepts a farmer ID from the browser. The verified Clerk `sub` is used to resolve the internal Supabase farmer UUID.

The Supabase secret key bypasses RLS. Therefore this API must remain the only path to these tables for this service, and every user-scoped query must be filtered using the farmer UUID resolved from the verified token. Never expose this key in the frontend. RLS remains enabled in Supabase as defence in depth, but no direct browser table access is provided by this backend.

Before a field pilot, add and test the farmer consent capture/withdrawal flow using `consent_records`, and confirm the data-retention and POPIA notices. The API currently stores diagnosis metadata only, not uploaded images or treatment advice.

## Local development

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
uvicorn app.main:app --reload --port 7860
```

Set the environment variables above before starting the API.
