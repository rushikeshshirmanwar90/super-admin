# 🧪 Bearer Token Testing Guide

## ⚡ Quick Test (2 minutes)

### Step 1: Check Console Logs
1. Open the super-admin app
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Look for these logs:
   ```
   🌐 API Base URL: http://10.40.193.12:8080
   🔐 Bearer Token configured: Yes
   ```

### Step 2: Make an API Call
1. Navigate to any page (e.g., Clients, Admins, Dashboard)
2. Check console for:
   ```
   🚀 API Request: {
     method: 'GET',
     url: '/api/client',
     hasAuth: true  ← Should be true!
   }
   ```

### Step 3: Verify in Network Tab
1. Open DevTools → Network tab
2. Refresh the page or click any button that makes an API call
3. Click on any API request (e.g., `client`)
4. Check **Headers** section
5. Look for **Request Headers**:
   ```
   Authorization: Bearer Q7xLm92GpTCnB3sZgWAeYR8dMloK5Ujf8vrw02nl
   ```

## ✅ Success Checklist

- [ ] Console shows "Bearer Token configured: Yes"
- [ ] Console shows "hasAuth: true" for API requests
- [ ] Network tab shows Authorization header in requests
- [ ] API calls return data successfully (no 401/403 errors)

## ❌ Troubleshooting

### Problem: "Bearer Token configured: No"
**Solution**: 
1. Check `.env` file has `NEXT_PUBLIC_BEARER_TOKEN`
2. Restart the development server
3. Clear browser cache

### Problem: "hasAuth: false"
**Solution**:
1. Check `lib/api.ts` has the Authorization header
2. Verify request interceptor is working
3. Check console for any errors

### Problem: 401 Unauthorized Error
**Solution**:
1. Verify token is correct in `.env`
2. Check server accepts this token format
3. Verify token hasn't expired

### Problem: Token not showing in Network tab
**Solution**:
1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Restart development server

## 🔍 Detailed Testing

### Test 1: Dashboard API Call
```
1. Go to Dashboard (/)
2. Check console for:
   🚀 API Request: { method: 'GET', url: '/api/client', hasAuth: true }
   🚀 API Request: { method: 'GET', url: '/api/admin', hasAuth: true }
3. Verify both have hasAuth: true
```

### Test 2: Create Client
```
1. Go to Clients → New Client
2. Fill in form and submit
3. Check console for:
   🚀 API Request: { method: 'POST', url: '/api/client', hasAuth: true }
4. Check Network tab for Authorization header
```

### Test 3: Update Admin
```
1. Go to Admins → Edit any admin
2. Update and save
3. Check console for:
   🚀 API Request: { method: 'PUT', url: '/api/admin?id=...', hasAuth: true }
4. Verify Authorization header in Network tab
```

## 📊 Expected Results

### Console Output
```
🌐 API Base URL: http://10.40.193.12:8080
🔐 Bearer Token configured: Yes
🚀 API Request: { method: 'GET', url: '/api/client', hasAuth: true }
✅ API Response: 200 /api/client
```

### Network Tab Headers
```
Request Headers:
  Accept: application/json, text/plain, */*
  Authorization: Bearer Q7xLm92GpTCnB3sZgWAeYR8dMloK5Ujf8vrw02nl
  Content-Type: application/json
```

## 🎯 All API Endpoints to Test

- [ ] GET /api/client (Dashboard, Clients page)
- [ ] GET /api/client?id={id} (Edit Client)
- [ ] POST /api/client (New Client)
- [ ] PUT /api/client?id={id} (Edit Client)
- [ ] DELETE /api/client?id={id} (Delete Client)
- [ ] GET /api/admin (Dashboard, Admins page)
- [ ] GET /api/admin?id={id} (Edit Admin)
- [ ] POST /api/admin (New Admin)
- [ ] PUT /api/admin?id={id} (Edit Admin)
- [ ] DELETE /api/admin?id={id} (Delete Admin)

## 🚀 Quick Commands

### Restart Development Server
```bash
cd /Users/chinmayshrimanwar/Desktop/pamu\ dada/app/super-admin
npm run dev
```

### Check Environment Variables
```bash
cat .env | grep BEARER_TOKEN
```

### Test API with curl
```bash
curl -X GET "http://10.40.193.12:8080/api/client" \
  -H "Authorization: Bearer Q7xLm92GpTCnB3sZgWAeYR8dMloK5Ujf8vrw02nl" \
  -H "Content-Type: application/json"
```

---

**Time Required**: 2-5 minutes
**Difficulty**: Easy
**Status**: Ready for testing
