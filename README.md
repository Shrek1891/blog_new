# Blog

## Deploy to Render

This repository includes a Render Blueprint (`render.yaml`) that creates a Node.js API and a static frontend. From Render, create a new Blueprint deployment and select this repository.

Before deploying, create a MongoDB database (for example, MongoDB Atlas) and provide its connection string as `MONGODB_URI` when prompted. In Atlas, allow connections from Render. Render generates `JWT_SECRET` and `COOKIE_SECRET`; do not reuse or commit local secrets. Cloudinary variables are optional and are needed only for image uploads.

The Blueprint connects the frontend and API URLs automatically, enables the API health check at `/health`, and configures SPA route fallback. The API uses Render's assigned port and accepts requests from the deployed frontend origin.

If you change either Render service name or attach a custom frontend domain, update `CORS_ORIGIN` on the API service to the exact frontend origin (including `https://`).

## Local development

Copy `.env.example` to `.env` and set the MongoDB connection string and secrets. In `frontend/.env`, set `VITE_API_URL=http://127.0.0.1:3000/api`.

Run the API with `npm run dev` and the frontend with `npm --prefix frontend run dev`.
