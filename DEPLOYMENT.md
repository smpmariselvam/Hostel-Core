# Deployment Guide

This project has two deployable apps:

- `backend`: Express API for auth, rooms, billing, PhonePe, etc.
- `frontend`: Vite React app.

## 1. Push To GitHub

Create a new GitHub repository, then run these commands from the project root:

```bash
git init
git add .
git commit -m "Prepare hostel management system for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Do not commit `.env` files. The root `.gitignore` already excludes them.

## 2. Deploy Backend On Vercel

Create a new Vercel project from the same GitHub repo.

Use these settings:

- Root Directory: `backend`
- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty

Add backend environment variables in Vercel:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
PHONEPE_MERCHANT_ID=your_phonepe_client_id
PHONEPE_SALT_KEY=your_phonepe_client_secret
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

After deploy, your backend URL will look like:

```text
https://your-backend-project.vercel.app
```

Test:

```text
https://your-backend-project.vercel.app/
```

It should say the Hostel Management API is running.

## 3. Deploy Frontend On Vercel

Create another Vercel project from the same GitHub repo.

Use these settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Add frontend environment variable:

```env
VITE_API_BASE_URL=https://your-backend-project.vercel.app/api
```

Deploy it. Your frontend URL will look like:

```text
https://your-frontend-project.vercel.app
```

## 4. PhonePe Redirect Notes

For deployed testing, the frontend sends its current origin to the backend when creating a payment, so PhonePe can redirect back to:

```text
https://your-frontend-project.vercel.app/dashboard/billing
```

If you later want a fixed frontend URL, add this backend env var in Vercel:

```env
FRONTEND_URL=https://your-frontend-project.vercel.app
```

For production PhonePe, replace sandbox credentials and base URL with production values from PhonePe.
