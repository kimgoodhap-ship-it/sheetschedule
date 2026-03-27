# Deployment Guide

## Backend Deployment

### Option 1: Railway (Recommended)

1. Push your backend code to a GitHub repo
2. Go to [Railway](https://railway.app/) and create a new project
3. Select "Deploy from GitHub repo"
4. Set the root directory to `backend/`
5. Add environment variables:
   - `GOOGLE_CREDENTIALS_BASE64` - Base64-encoded service account JSON
   - `GOOGLE_SPREADSHEET_ID` - Your spreadsheet ID
   - `ALLOWED_ORIGINS` - Your frontend URL (e.g., `https://your-app.netlify.app`)
6. Railway will auto-detect the Dockerfile and deploy

### Option 2: Render

1. Go to [Render](https://render.com/) and create a new Web Service
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add the same environment variables as above

### Option 3: Google Cloud Run

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/sheetschedule-api
gcloud run deploy sheetschedule-api \
  --image gcr.io/YOUR_PROJECT/sheetschedule-api \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CREDENTIALS_BASE64=...,GOOGLE_SPREADSHEET_ID=...,ALLOWED_ORIGINS=..."
```

## Frontend Deployment

### Option 1: Netlify (Recommended)

1. Go to [Netlify](https://netlify.com/) and create a new site
2. Connect your GitHub repo
3. Set:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` - Your backend URL (e.g., `https://your-api.railway.app/api`)
5. Deploy

### Option 2: Vercel

1. Go to [Vercel](https://vercel.com/) and import your repo
2. Set root directory to `frontend`
3. Add environment variable `VITE_API_URL`
4. Deploy

### Option 3: Any Static Host

Build locally and upload:
```bash
cd frontend
VITE_API_URL=https://your-backend-url.com/api npm run build
```

Upload the `dist/` folder to any static hosting (S3, GitHub Pages, etc.)

## Security Notes

**CORS**: Never use `ALLOWED_ORIGINS=*` in production. Always set it to your specific frontend domain:
```
ALLOWED_ORIGINS=https://your-app.netlify.app
```

**HTTPS**: Always use HTTPS for both frontend and backend in production. Google Sheets API credentials travel through your backend — HTTP would expose them.

**Credentials**: Never commit `credentials.json` or `.env` to git. Use environment variables in your hosting platform (Railway, Render, Cloud Run) instead of files.

**Base64 Credentials**: When using `GOOGLE_CREDENTIALS_BASE64`, set it only in your deployment platform's environment variables, never in code or config files.

## Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-api-url/api/health`
- [ ] Frontend loads and shows the Gantt chart
- [ ] Can create a new schedule (check it appears in Google Sheets)
- [ ] Can edit/delete schedules
- [ ] Drag and drop works
- [ ] PNG export works
- [ ] CORS is set to your specific domain (not `*`)
- [ ] No credentials in git history
