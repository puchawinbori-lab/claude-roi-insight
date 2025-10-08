# Deployment Guide

This guide covers deploying the Claude ROI Insight application with:
- **Frontend**: Lovable (or Vercel/Netlify)
- **Backend**: Render, Railway, or Fly.io

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Lovable        │────────▶│  Python Flask    │────────▶│  JIRA API       │
│  (Frontend)     │  HTTPS  │  (Backend)       │  HTTPS  │  (Atlassian)    │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

---

## 🚀 Quick Start: Deploy Backend to Render

### Step 1: Prepare Your Repository

✅ Already done! Your repo is ready to deploy.

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up (free tier available)
3. Connect your GitHub account

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect repository: `puchawinbori-lab/claude-roi-insight`
3. Configure:

```
Name:            claude-roi-backend
Root Directory:  backend
Environment:     Python 3
Build Command:   pip install -r requirements.txt
Start Command:   gunicorn --bind 0.0.0.0:$PORT app:app
```

### Step 4: Environment Variables (Optional)

In Render dashboard, add these if needed:
```
PYTHON_VERSION=3.11.0
```

### Step 5: Deploy

Click **"Create Web Service"** - Render will:
1. Clone your repo
2. Install dependencies
3. Start your Flask server
4. Give you a URL like: `https://claude-roi-backend.onrender.com`

### Step 6: Update Frontend

In **Lovable** project settings:
1. Go to Environment Variables
2. Add:
   ```
   VITE_API_URL=https://claude-roi-backend.onrender.com
   ```
3. Save and rebuild

### Step 7: Test

1. Visit your Lovable site
2. Submit the form
3. Check browser console - you should see:
   ```
   🎯 Resolved API_URL: https://claude-roi-backend.onrender.com
   ```

---

## Alternative: Deploy to Railway

### Step 1: Install Railway CLI (Optional)

```bash
npm install -g @railway/cli
railway login
```

Or use the web dashboard: https://railway.app

### Step 2: Create New Project

**Via Dashboard:**
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose: `puchawinbori-lab/claude-roi-insight`
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

**Via CLI:**
```bash
cd backend
railway init
railway up
```

### Step 3: Get Your URL

Railway will give you a URL like:
```
https://claude-roi-backend-production.up.railway.app
```

### Step 4: Update Frontend

Same as Render - add `VITE_API_URL` in Lovable.

---

## Alternative: Deploy to Fly.io

### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### Step 2: Create fly.toml

Create `backend/fly.toml`:
```toml
app = "claude-roi-backend"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[env]
  PORT = "8080"
```

### Step 3: Deploy

```bash
cd backend
fly launch --no-deploy
fly deploy
```

### Step 4: Get URL

```bash
fly status
```

URL will be: `https://claude-roi-backend.fly.dev`

---

## CORS Configuration

The backend is configured to allow all origins:

```python
CORS(app)  # Allows all origins
```

For production, you can restrict to your frontend domain:

```python
CORS(app, origins=["https://your-lovable-site.lovable.app"])
```

---

## Environment Variables

### Frontend (Lovable)

Required:
```bash
VITE_API_URL=https://your-backend-url.com
```

### Backend (Render/Railway/Fly.io)

Optional:
```bash
PORT=5001                    # Auto-set by most platforms
HOST=0.0.0.0                # Auto-set by most platforms
PYTHON_VERSION=3.11.0       # For Render
```

---

## Troubleshooting

### Backend not starting

**Check logs:**
- Render: Dashboard → Logs
- Railway: Dashboard → Deployments → Logs
- Fly.io: `fly logs`

**Common issues:**
1. Missing `gunicorn` in requirements.txt → Fixed ✅
2. Wrong start command
3. Port binding issues

### Frontend can't connect to backend

**Check:**
1. Backend is running: `curl https://your-backend-url.com/api/health`
2. VITE_API_URL is set correctly in Lovable
3. Frontend was rebuilt after adding env var
4. Check browser console for detailed error logs

### CORS errors

**Symptoms:**
```
Access to fetch has been blocked by CORS policy
```

**Fix:**
Update `backend/app.py`:
```python
CORS(app, origins=["https://your-lovable-site.lovable.app"])
```

---

## Health Check

Once deployed, test your backend:

```bash
# Health check
curl https://your-backend-url.com/api/health

# Expected response:
{
  "status": "healthy",
  "message": "Claude ROI API is running"
}
```

---

## Cost Estimate

| Service  | Free Tier | Paid |
|----------|-----------|------|
| Render   | 750 hours/month | $7/month |
| Railway  | $5 credit/month | Usage-based |
| Fly.io   | 3 VMs free | Usage-based |
| Lovable  | Free | Various plans |

**Recommendation**: Start with Render's free tier.

---

## Monitoring

### Render
- Dashboard → Metrics
- View CPU, memory, requests

### Railway
- Dashboard → Metrics
- Real-time logs

### Fly.io
```bash
fly status
fly logs
fly dashboard
```

---

## Scaling

If you need more performance:

1. **Render**: Upgrade to paid plan, increase instance type
2. **Railway**: Add resources in dashboard
3. **Fly.io**: Scale replicas: `fly scale count 2`

---

## Security Notes

1. **Never commit secrets** to git:
   - `.env` is in `.gitignore` ✅
   - Use environment variables for API tokens

2. **CORS**: For production, restrict to your domain:
   ```python
   CORS(app, origins=["https://your-domain.com"])
   ```

3. **HTTPS**: All platforms provide free SSL ✅

4. **Rate Limiting**: Consider adding for production:
   ```bash
   pip install Flask-Limiter
   ```

---

## Next Steps After Deployment

1. ✅ Backend deployed and healthy
2. ✅ Frontend connected to backend
3. ✅ Test the full flow with real JIRA data
4. 📊 Monitor logs for any issues
5. 🔒 Add rate limiting (optional)
6. 📈 Set up monitoring alerts (optional)

---

## Support

- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Fly.io: https://fly.io/docs
- Lovable: https://lovable.dev/docs

For application issues, check:
- `PRODUCTION_TROUBLESHOOTING.md`
- `DIAGNOSTIC_SCRIPT.js`
- Backend logs on your deployment platform
