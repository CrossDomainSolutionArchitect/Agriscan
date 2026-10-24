# Agriscan

Agriscan is a React web application for crop disease analysis. Users can upload
a crop or leaf image, use their device camera, send the image to the Agriscan
AI model, and receive a diagnosis, confidence scores, and agronomic guidance.

Production site: [agri-scan.co.za](https://agri-scan.co.za)

## Features

- Crop selection for maize, tomato, citrus, and potato.
- Image upload with JPG, PNG, and WEBP support.
- Camera capture on supported devices.
- AI prediction through the
  [`Vernard/agriscan-ai-demo`](https://huggingface.co/spaces/Vernard/agriscan-ai-demo)
  Hugging Face Space using `@gradio/client`.
- Confidence scores for the model's predictions.
- Local recommendation data for supported disease labels.
- Recommendation details including:
  - urgency level;
  - summary and symptoms;
  - recommended actions; and
  - an agricultural expert consultation warning where appropriate.
- Recommendation safety gating when confidence is below 60% or no matching
  recommendation is available.
- Clerk authentication before users enter the Agriscan and SkinScan demos.
- Responsive layout and print-friendly analysis results.

## Technology

- React 18
- Vite
- React Router
- Clerk React
- Hugging Face Gradio client
- Vitest and Testing Library

## Requirements

- Node.js 18 or newer
- npm
- A Clerk application with the production domain configured
- Access to the Agriscan Hugging Face Space

## Local setup

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

Only the Clerk publishable key belongs in the Vite frontend. Never put
`CLERK_SECRET_KEY` in source code, `.env.local` committed to Git, or any
client-side bundle.

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Using the application

1. Open the landing page.
2. Select **Request Demo** or **Go to demo**.
3. Complete Clerk sign-up or sign-in when prompted.
4. Choose a crop or upload a crop image.
5. Select **Use camera** or **Choose an image**.
6. Select **Analyze Image**.
7. Review the diagnosis, confidence scores, and recommendation.

The recommendation database is stored in
[`src/data/diseaseRecommendations.json`](./src/data/diseaseRecommendations.json).
The model label is normalized before lookup so common formats such as
`Tomato___Late_blight` can match a recommendation key such as
`Tomato Late blight`.

## Available scripts

### `npm start`

Starts the Vite development server on port 3000.

### `npm test`

Runs the Vitest test runner.

### `npm run build`

Creates the optimized production bundle in `dist`.

### `npm run preview`

Serves the production bundle locally for verification.

### `npm run deploy`

Builds the application and publishes `dist` to the `gh-pages` branch using
`gh-pages`. GitHub authentication must be configured before running this
command.

## Project structure

```text
src/
├── components/
│   └── Agriscan/              # Crop selection, upload, camera, and results
├── data/
│   └── diseaseRecommendations.json
├── pages/
│   ├── AgriscanPage/
│   └── SkinScanPage/
├── services/
│   └── agriscanService.js     # Gradio connection and result parsing
├── App.jsx                    # Routes and protected demo access
└── main.jsx                   # Clerk and React Router providers
public/                        # Static images and GitHub Pages files
```

## Authentication

Clerk is initialized in `src/main.jsx` using
`VITE_CLERK_PUBLISHABLE_KEY`. The `/agriscan` and `/skinscan` routes require
an authenticated Clerk user. When an unauthenticated user selects a demo,
the Clerk sign-up modal opens and returns the user to the requested route after
authentication.

Production Clerk account pages:

- Sign in: [accounts.agri-scan.co.za/sign-in](https://accounts.agri-scan.co.za/sign-in)
- Sign up: [accounts.agri-scan.co.za/sign-up](https://accounts.agri-scan.co.za/sign-up)
- Unauthorized sign in: [accounts.agri-scan.co.za/unauthorized-sign-in](https://accounts.agri-scan.co.za/unauthorized-sign-in)

## Deployment

The production site uses GitHub Pages with the `gh-pages` branch and the
custom domain `agri-scan.co.za`. The Vite base path is `/`, as configured in
`vite.config.js`.

Before deploying:

1. Configure `VITE_CLERK_PUBLISHABLE_KEY` in the build environment.
2. Configure Clerk's production instance for `agri-scan.co.za`.
3. Allow the production application and demo redirect URLs in Clerk.
4. Authenticate GitHub.
5. Run:

   ```bash
   npm run deploy
   ```

Demo links use React Router client-side navigation. This is important for
GitHub Pages because direct server requests to `/agriscan` or `/skinscan` may
otherwise return a 404 instead of allowing the single-page application to
handle the route.

## Disclaimer

Agriscan provides AI-generated information for general guidance only. Results
are not a substitute for professional agronomic advice. Confirm diagnoses with
a qualified agricultural extension officer before applying chemical treatments,
and follow all local regulations and product label instructions.
