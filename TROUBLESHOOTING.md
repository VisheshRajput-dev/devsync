# Railway Deployment Troubleshooting

## "CAN'T GET" or 404 Errors

### 1. Check Railway Deployment Logs

1. Go to Railway Dashboard
2. Click on your service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Check the **Logs** section

**Look for:**
- ✅ `🚀 Devsync backend server running on port XXXX` - Server started successfully
- ❌ Any error messages in red
- ❌ "EADDRINUSE" - Port conflict
- ❌ "Module not found" - Missing dependencies

### 2. Verify Environment Variables

In Railway → **Variables** tab, check:

- `PORT` - Railway sets this automatically. Don't override it unless necessary.
- `CORS_ORIGIN` - Should be your Vercel URL (e.g., `https://your-app.vercel.app`)

### 3. Check Deployment Status

In Railway → **Deployments**:
- Status should be **"Active"** or **"Live"**
- If it's **"Failed"**, check the logs

### 4. Test Endpoints

After deployment, test:

```bash
# Root endpoint
curl https://devsync-production-80da.up.railway.app/

# Health check
curl https://devsync-production-80da.up.railway.app/health
```

**Expected responses:**

Root (`/`):
```json
{
  "message": "Devsync Backend API",
  "status": "OK",
  "version": "1.0.0"
}
```

Health (`/health`):
```json
{
  "status": "OK",
  "rooms": 0,
  "timestamp": "2024-..."
}
```

### 5. Common Issues

#### Issue: Server not starting
**Solution:** Check logs for:
- Missing `node_modules` - Railway should install automatically
- Wrong Node.js version - Ensure compatibility
- Build errors - Check build logs

#### Issue: Port already in use
**Solution:** Remove custom `PORT` variable, let Railway set it automatically

#### Issue: CORS errors in browser
**Solution:** 
- Ensure `CORS_ORIGIN` includes your frontend URL
- Format: `https://your-app.vercel.app` (no trailing slash)
- For multiple: `https://app1.vercel.app,https://app2.vercel.app`

#### Issue: Socket.io connection fails
**Solution:**
- Verify backend URL is correct
- Check that Socket.io server initialized (check logs)
- Ensure CORS includes your frontend URL
- Check browser console for WebSocket errors

### 6. Force Redeploy

If changes aren't deploying:

1. Go to Railway → **Deployments**
2. Click **"Redeploy"** on latest deployment
3. Or push a new commit to trigger deployment

### 7. Check Service Status

Railway → Service Overview:
- **Status:** Should be "Active"
- **Uptime:** Should show running time
- **Logs:** Should show recent activity

### 8. Verify Build Process

Check that Railway is:
1. ✅ Detecting Node.js correctly
2. ✅ Installing dependencies (`npm install`)
3. ✅ Running start command (`npm start`)
4. ✅ Server listening on Railway's PORT

### 9. Network Configuration

Railway → **Settings** → **Networking**:
- ✅ **Public Networking** enabled
- ✅ **Generate Domain** button clicked (or custom domain added)
- ✅ Domain shows as "Active"

---

## Quick Health Check Commands

```bash
# Test root endpoint
curl https://devsync-production-80da.up.railway.app/

# Test health endpoint
curl https://devsync-production-80da.up.railway.app/health

# Test with verbose output (see headers)
curl -v https://devsync-production-80da.up.railway.app/health
```

---

## Still Having Issues?

1. **Check Railway Status Page:** https://status.railway.app/
2. **Review Railway Logs:** Most issues show up in deployment logs
3. **Verify Code:** Test locally first (`npm start` in backend folder)
4. **Check Dependencies:** Ensure all packages are in `package.json`

