# Production Troubleshooting Guide

## "Failed to Fetch" Error in Production

If you're seeing "failed to fetch" errors in production but it works in development, follow these steps:

### 1. Check Browser Console Logs

Open the browser console (F12) and look for the enhanced logging:

```
🔍 [FORM] Starting JIRA fetch...
🔍 [FORM] API URL: <what URL is being used?>
🔍 [FORM] Full endpoint: <full API endpoint>
🔍 [FORM] Environment: <production or development>
```

**What to look for:**
- Is the API URL correct? It should point to your backend server
- Is it using `http://localhost:5001` in production? (This won't work!)

### 2. Common Production Issues

#### Issue: API URL is localhost in production
**Symptom:** `API URL: http://localhost:5001` in production

**Fix:** Set the `VITE_API_URL` environment variable in your production build:

**For Vercel/Netlify:**
- Go to your project settings → Environment Variables
- Add: `VITE_API_URL=https://your-backend-url.com`
- Rebuild the frontend

**For custom hosting:**
- Create a `.env.production` file:
  ```
  VITE_API_URL=https://your-backend-url.com
  ```
- Rebuild: `npm run build`

#### Issue: CORS Error
**Symptom:** Browser console shows:
```
Access to fetch at 'https://backend.com/api/fetch-jira' from origin 'https://frontend.com'
has been blocked by CORS policy
```

**Fix:** Update backend CORS settings in `backend/app.py`:
```python
from flask_cors import CORS

# Allow specific origins
CORS(app, origins=["https://your-frontend-domain.com"])

# Or allow all (less secure)
CORS(app, origins="*")
```

#### Issue: Backend not running
**Symptom:** Network error, connection refused

**Fix:** Ensure your backend is deployed and running:
```bash
# Check if backend is accessible
curl https://your-backend-url.com/api/health
```

Should return:
```json
{"status": "healthy", "message": "Claude ROI API is running"}
```

#### Issue: Mixed Content (HTTP/HTTPS)
**Symptom:** Frontend is HTTPS but trying to connect to HTTP backend

**Fix:**
- Either use HTTPS for both frontend and backend
- Or use HTTP for both (not recommended for production)

### 3. Backend Logging

Check your backend logs for these messages:

```
🔵 [HH:MM:SS] Incoming POST request to /api/fetch-jira
   Remote addr: <client IP>
   Origin: <frontend domain>
```

**If you don't see this:**
- Backend is not receiving the request
- Check firewall rules
- Check if backend is listening on the correct port
- Verify DNS/domain configuration

**If you see errors after this:**
- Check the specific error message in the backend logs
- Common errors:
  - JIRA authentication failure (401)
  - Missing fields (400)
  - Network connectivity to JIRA

### 4. Environment Variables Checklist

**Frontend (.env or .env.production):**
```bash
VITE_API_URL=<your-backend-url>  # NO trailing slash!
```

**Backend (environment variables or .env):**
```bash
PORT=5001  # or your production port
HOST=0.0.0.0  # allows external connections
```

### 5. Testing Steps

1. **Test backend health endpoint:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```
   Should return: `{"status": "healthy", ...}`

2. **Test CORS:**
   ```bash
   curl -X OPTIONS https://your-backend-url.com/api/fetch-jira \
     -H "Origin: https://your-frontend-url.com" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```
   Look for `Access-Control-Allow-Origin` header in response

3. **Test the API endpoint directly:**
   ```bash
   curl -X POST https://your-backend-url.com/api/fetch-jira \
     -H "Content-Type: application/json" \
     -d '{
       "jira_url": "https://your-instance.atlassian.net",
       "email": "your-email@example.com",
       "api_token": "your-token",
       "project_name": "Your Project",
       "claude_adoption_date": "2025-08-25"
     }'
   ```

### 6. Deployment-Specific Guides

#### Vercel (Frontend)
1. Environment Variables: Settings → Environment Variables
2. Add `VITE_API_URL` for Production, Preview, and Development
3. Redeploy after adding variables

#### Netlify (Frontend)
1. Site settings → Build & deploy → Environment
2. Add `VITE_API_URL`
3. Trigger new deploy

#### Railway/Render (Backend)
1. Add environment variables in dashboard
2. Ensure `PORT` is set (usually auto-configured)
3. Check logs for startup messages

### 7. Quick Diagnostic Script

Run this in browser console on your production site:

```javascript
// Check what API URL is being used
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Test backend connection
fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend healthy:', d))
  .catch(e => console.error('❌ Backend error:', e));
```

### 8. Still Having Issues?

Collect this information:
1. Frontend URL: `______`
2. Backend URL: `______`
3. Browser console logs (full output from form submission)
4. Backend server logs (last 50 lines)
5. Network tab HAR export showing the failed request
6. Deployment platform (Vercel/Netlify/other)

Then check:
- Are both services in the same region/cloud provider?
- Are there any firewall rules blocking the connection?
- Is the backend accessible from other locations (use a tool like https://reqbin.com/)?
