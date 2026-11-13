# Free deployment setup

PlaceTrack can be deployed as a Vercel static frontend, a Render Node API, and a hosted PostgreSQL database. The Vercel Hobby plan and Render free services are intended for personal/hobby use. Render's free API service sleeps after 15 minutes of inactivity, so its first request after a quiet period can take about a minute. Render's free Postgres expires after 30 days; use a PostgreSQL provider with a continuing free allowance for a longer-lived demo.

## 1. Create a PostgreSQL database

Create a PostgreSQL database with a provider you choose and copy its TLS connection string. Keep the connection string private. The API creates the current PlaceTrack schema automatically when it first starts against an empty database. Existing databases are left intact and still need the migrations documented in the README.

## 2. Deploy the API on Render

Create a Blueprint from this GitHub repository and select `render.yaml`. Set:

- `DATABASE_URL`: the PostgreSQL TLS connection string
- `CLIENT_ORIGIN`: the exact deployed frontend origin, such as `https://placetrack.vercel.app`
- `JWT_SECRET`: let Render generate a secure value

The API health endpoint is `/api/health`.

## 3. Deploy the frontend on Vercel

Import the GitHub repository as a Vite project. Set the root directory to `client`, the build command to `npm run build`, and the output directory to `dist`. Add this environment variable before deploying:

- `VITE_API_URL`: `https://<your-render-api-host>/api`

After the first frontend deployment, copy its origin into Render's `CLIENT_ORIGIN` setting and redeploy the API. Vercel's rewrite config keeps client-side routes working on refresh.

## 4. Verify

Open the API's `/api/health`, load the frontend, create an account, sign in, create an opportunity, and confirm it appears after refreshing. Do not use real sensitive application data in a public demo database.
