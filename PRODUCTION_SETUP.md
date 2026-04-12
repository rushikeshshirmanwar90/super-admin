# Production Setup Guide - Using xsite.tech

## 🌐 Configuration for Production Domain

Your super-admin dashboard is now configured to use `https://xsite.tech` as the API endpoint.

## ✅ Changes Made

### 1. Updated `.env.local`
```env
NEXT_PUBLIC_API_URL=https://xsite.tech
```

### 2. Updated `lib/api.ts`
- Added timeout (30 seconds)
- Added detailed error logging
- Added user-friendly error messages
- Added request/response interceptors for debugging

### 3. Updated `real-estate-apis/next.config.ts`
- Added CORS headers to allow cross-origin requests
- Configured to accept requests from any origin

## 🚀 How to Use

### Step 1: Restart Super Admin Server

**IMPORTANT:** After changing `.env.local`, you MUST restart the server!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd super-admin
npm run dev
```

### Step 2: Deploy Real Estate APIs (if needed)

If you made changes to `next.config.ts` in real-estate-apis:

```bash
cd real-estate-apis

# For local testing
npm run dev

# For production deployment
npm run build
# Then deploy to your hosting (Vercel, etc.)
```

### Step 3: Test the Connection

Open browser console (F12) and check for:
```
🌐 API Base URL: https://xsite.tech
🚀 API Request: GET /api/client
✅ API Response: 200 /api/client
```

## 🔍 Troubleshooting

### Issue 1: ERR_NETWORK Error

**Symptoms:**
```
AxiosError: Network Error
code: "ERR_NETWORK"
```

**Possible Causes & Solutions:**

#### A. CORS Not Configured
**Solution:** Make sure you've updated `real-estate-apis/next.config.ts` with CORS headers and redeployed.

#### B. API Server Not Running
**Solution:** Verify your API is accessible:
```bash
curl https://xsite.tech/api/client
```

Should return JSON response.

#### C. SSL/HTTPS Issues
**Solution:** Make sure your domain has a valid SSL certificate.

#### D. Firewall/Network Blocking
**Solution:** Check if your network/firewall is blocking the request.

### Issue 2: CORS Error

**Symptoms:**
```
Access to XMLHttpRequest at 'https://xsite.tech/api/client' 
from origin 'http://localhost:8000' has been blocked by CORS policy
```

**Solution:**

1. Verify CORS headers in `real-estate-apis/next.config.ts`
2. Redeploy your API
3. Clear browser cache (Ctrl+Shift+R)

### Issue 3: Timeout Error

**Symptoms:**
```
Request timeout. Please try again.
```

**Solution:**

1. Check your internet connection
2. Verify API server is responding
3. Increase timeout in `lib/api.ts`:
```typescript
timeout: 60000, // 60 seconds
```

## 🧪 Testing

### Test 1: Direct API Access

Open browser and go to:
```
https://xsite.tech/api/client
```

Expected response:
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": [...]
}
```

### Test 2: Check Console Logs

Open browser console (F12) and look for:
```
🌐 API Base URL: https://xsite.tech
🚀 API Request: GET /api/client
✅ API Response: 200 /api/client
```

### Test 3: Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `/api/client` request
5. Check:
   - Status: 200 OK
   - Response: JSON with data
   - Headers: CORS headers present

## 📝 Environment Configuration

### Development (Local API)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production (xsite.tech)
```env
NEXT_PUBLIC_API_URL=https://xsite.tech
```

### Custom Domain
```env
NEXT_PUBLIC_API_URL=https://your-custom-domain.com
```

## 🔐 Security Considerations

### Current Setup (Development)
```typescript
Access-Control-Allow-Origin: *  // Allows all origins
```

### Recommended for Production
Update `real-estate-apis/next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { 
          key: "Access-Control-Allow-Origin", 
          value: "https://your-super-admin-domain.com" // Specific domain only
        },
        // ... other headers
      ],
    },
  ];
},
```

## 🚀 Deployment Options

### Option 1: Deploy Super Admin to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://xsite.tech
   ```
4. Deploy

### Option 2: Deploy to Netlify

1. Push code to GitHub
2. Connect to Netlify
3. Add environment variable in Netlify dashboard
4. Deploy

### Option 3: Deploy to Your Own Server

1. Build the project:
   ```bash
   npm run build
   ```
2. Copy `.next` folder to server
3. Set environment variable
4. Run:
   ```bash
   npm start
   ```

## 📊 Monitoring

### Check API Health

Create a simple health check:
```bash
# Check if API is up
curl -I https://xsite.tech/api/client

# Should return:
HTTP/2 200
```

### Monitor Errors

Check browser console for:
- ❌ Network errors
- ❌ CORS errors
- ❌ Timeout errors
- ❌ 404/500 errors

## 🔄 Switching Between Environments

### Quick Switch Script

Create `switch-env.sh`:
```bash
#!/bin/bash

if [ "$1" == "local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
    echo "✅ Switched to LOCAL environment"
elif [ "$1" == "production" ]; then
    echo "NEXT_PUBLIC_API_URL=https://xsite.tech" > .env.local
    echo "✅ Switched to PRODUCTION environment"
else
    echo "Usage: bash switch-env.sh [local|production]"
fi

echo "⚠️  Remember to restart the dev server!"
```

Usage:
```bash
bash switch-env.sh local       # Use localhost
bash switch-env.sh production  # Use xsite.tech
```

## ✅ Verification Checklist

Before going live, verify:

- [ ] `.env.local` has correct API URL
- [ ] CORS headers configured in API
- [ ] API is accessible from browser
- [ ] Super admin server restarted
- [ ] No console errors
- [ ] Dashboard loads data
- [ ] Can perform CRUD operations
- [ ] All pages work correctly
- [ ] Mobile responsive
- [ ] SSL certificate valid

## 🎯 Expected Behavior

### Success Indicators

1. **Console shows:**
   ```
   🌐 API Base URL: https://xsite.tech
   🚀 API Request: GET /api/client
   ✅ API Response: 200 /api/client
   ```

2. **Dashboard displays:**
   - Statistics with real numbers
   - Client cards with data
   - No error messages

3. **Network tab shows:**
   - Status: 200 OK
   - Response: Valid JSON
   - CORS headers present

## 🐛 Common Issues

### Issue: "Cannot connect to server"

**Check:**
1. Is `https://xsite.tech` accessible?
2. Is the API endpoint correct?
3. Is CORS configured?
4. Did you restart the server?

### Issue: Data not loading

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. API response format
4. Environment variable loaded

### Issue: CORS policy error

**Check:**
1. CORS headers in `next.config.ts`
2. API redeployed with new config
3. Browser cache cleared

## 📞 Need Help?

1. Check browser console (F12)
2. Check Network tab
3. Test API directly: `https://xsite.tech/api/client`
4. Verify environment variable: `console.log(process.env.NEXT_PUBLIC_API_URL)`
5. Check CORS headers in response

## 🎉 Success!

If you see:
- ✅ Dashboard loads
- ✅ Data displays
- ✅ No errors in console
- ✅ CRUD operations work

You're all set! Your super admin is now connected to production! 🚀

---

**Important:** Always restart the dev server after changing `.env.local`!
