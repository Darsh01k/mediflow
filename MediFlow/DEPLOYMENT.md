# MediFlow Deployment Guide

This guide details how to deploy the **MediFlow** Patient Management Platform to production using **Neon PostgreSQL** (database), **Render** (backend web service), and **Vercel** (frontend application).

---

## 1. Database Provisioning (Neon PostgreSQL)

1. Sign in to your account at [Neon](https://neon.tech/).
2. Create a new project and select **PostgreSQL 16+**.
3. Retrieve your connection string from the dashboard. It will look like this:
   `postgres://[username]:[password]@[neon-host]/neondb`
4. Note your credentials and append `?sslmode=require` to the JDBC connection URL:
   - **JDBC URL**: `jdbc:postgresql://[neon-host]/neondb?sslmode=require`
   - **Username**: `[username]`
   - **Password**: `[password]`

---

## 2. Backend Web Service Deployment (Render)

The repository includes a `render.yaml` Blueprint specification, enabling quick deployment.

1. Create a repository on GitHub and push the root directory containing `mediflow-backend`, `mediflow-frontend`, `render.yaml`, and other files.
2. Sign in to [Render](https://render.com/).
3. Navigate to **Blueprints** and click **New Blueprint Instance**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` template. Provide the required values for the environment parameters when prompted:
   - `SPRING_DATASOURCE_URL`: The JDBC URL from Neon (with `?sslmode=require`).
   - `SPRING_DATASOURCE_USERNAME`: Neon database user.
   - `SPRING_DATASOURCE_PASSWORD`: Neon database password.
   - `JWT_SECRET`: A secure 256-bit hexadecimal string (e.g. `f12bb56a73c9c991ba5f22e86c8d7641f23bb1dcd20e0ffde63d41f02ecb1ff1`).
   - `ALLOWED_ORIGINS`: Comma-separated domains allowed to call the backend APIs (e.g. `http://localhost:5173,https://*.vercel.app,https://yourdomain.vercel.app`).
6. Click **Approve** to build and launch the service.
7. Once deployed, copy your Render service URL (e.g., `https://mediflow-backend.onrender.com`).

---

## 3. Frontend Application Deployment (Vercel)

Vercel hosts the React client as a static SPA.

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. In the project settings, configure the following:
   - **Framework Preset**: Vite
   - **Root Directory**: `mediflow-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add the API connection key:
   - **Key**: `VITE_API_URL`
   - **Value**: `[YOUR_RENDER_SERVICE_URL]/api` (e.g., `https://mediflow-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will build and launch your application.
6. Copy your Vercel deployment URL (e.g. `https://mediflow.vercel.app`).

---

## 4. Post-Deployment Integrity Checks

1. Verify CORS: Copy your Vercel URL and add it to `ALLOWED_ORIGINS` in Render if you haven't already.
2. Visit the Vercel site, verify you can access the `/login` route, create a new patient account (which will hit the Render API and register in the Neon database), and log in.
3. Access the Dashboards to ensure data metrics load seamlessly.
