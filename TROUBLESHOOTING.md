# Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: Cannot Fetch Data / API Connection Failed

#### Symptoms
- Dashboard shows "Loading..." forever
- Console shows network errors
- "Failed to fetch clients" error

#### Solutions

**Step 1: Verify Both Servers Are Running**

Terminal 1 - Real Estate APIs:
```bash
cd /Users/chinmayshrimanwar/Desktop/pamu\ dada/app/real-estate-apis
npm run dev
```
Should show: `ready - started server on 0.0.0.0:8080`

Terminal 2 - Super Admin:
```bash
cd /Users/chinmayshrimanwar/Desktop/pamu\ dada/app/super-admin
npm run dev
```
Should show: `ready - started server on 0.0.0.0:8000`

**Step 2: Test API Directly**

Open browser and go to:
```
http://localhost:8080/api/client
```

Expected response:
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": [...]
}
```

If you get an error or "No clients found", you need to add some test data first.

**Step 3: Check CORS Settings**

If you see CORS errors in console, add this to your real-estate-apis `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:8000" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};
```

**Step 4: Verify Environment Variables**

Check `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

After changing, restart the dev server!

### Issue 2: Data Shows But Looks Wrong

#### Check Response Structure

Open browser console (F12) → Network tab → Click on API request → Preview

The response should be:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      ...
    }
  ]
}
```

### Issue 3: "No clients found" Error

#### Add Test Data

Use the "Add Client" form or use this curl command:

```bash
curl -X POST http://localhost:8080/api/client \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "test@example.com",
    "phoneNumber": 9876543210,
    "city": "Mumbai",
    "state": "Maharashtra",
    "address": "123 Test Street",
    "licenseDays": 365
  }'
```

### Issue 4: Toast Notifications Not Showing

#### Import CSS

Make sure `react-toastify` CSS is imported in `app/layout.tsx`:

```typescript
import 'react-toastify/dist/ReactToastify.css';
```

### Issue 5: Components Not Rendering

#### Check Browser Console

Press F12 → Console tab

Common errors:
- **Module not found**: Run `npm install`
- **Unexpected token**: Check for syntax errors
- **Cannot read property**: Check data structure

### Issue 6: Styles Look Broken

#### Solutions

1. **Clear Browser Cache**
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Rebuild Tailwind**
   ```bash
   npm run build
   npm run dev
   ```

### Issue 7: Port Already in Use

#### Error Message
```
Error: listen EADDRINUSE: address already in use :::8000
```

#### Solutions

**Option 1: Kill the Process**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)
```

**Option 2: Use Different Port**

Edit `package.json`:
```json
"scripts": {
  "dev": "next dev -p 8001"
}
```

## 🐛 Debugging Steps

### Step 1: Check API Response

Add console.log to see what you're getting:

```typescript
const fetchClients = async () => {
  try {
    const response = await clientAPI.getAll()
    console.log('Full Response:', response)
    console.log('Response Data:', response.data)
    console.log('Clients:', response.data.data)
    // ... rest of code
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Step 2: Test API Endpoints

Create a test file `test-api.js`:

```javascript
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:8080/api/client');
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
```

Run it:
```bash
node test-api.js
```

### Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for API calls
5. Check:
   - Status code (should be 200)
   - Response data
   - Request headers

### Step 4: Verify Database Connection

Check real-estate-apis terminal for:
```
✅ MongoDB connected successfully
```

If not, check your MongoDB connection string in `.env`

## 📝 Quick Fixes

### Fix 1: Response Structure Mismatch

If you see `undefined` for client data, the API response structure might be different.

Check what the API actually returns:
```typescript
console.log('API Response:', response.data)
```

Then adjust the code:
```typescript
// If API returns { success: true, data: [...] }
const clients = response.data.data

// If API returns { clientData: [...] }
const clients = response.data.clientData

// If API returns [...] directly
const clients = response.data
```

### Fix 2: CORS Error

Add to `real-estate-apis/next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
      ],
    },
  ]
}
```

### Fix 3: Environment Variables Not Loading

1. Restart dev server after changing `.env.local`
2. Make sure variable starts with `NEXT_PUBLIC_`
3. Check for typos in variable name

## 🔧 Advanced Debugging

### Enable Detailed Logging

Add to `lib/api.ts`:

```typescript
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    return config;
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return Promise.reject(error);
  }
);
```

### Check API Health

Create a health check endpoint test:

```bash
curl http://localhost:8080/api/health
```

## 📞 Still Having Issues?

### Checklist

- [ ] Both servers running (8080 and 8000)
- [ ] No errors in terminal
- [ ] No errors in browser console
- [ ] API returns data when tested directly
- [ ] Environment variables set correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Browser cache cleared

### Get More Help

1. Check browser console for specific error messages
2. Check terminal for server errors
3. Test API endpoints directly in browser
4. Verify MongoDB is connected
5. Check network tab for failed requests

### Common Error Messages

**"Network Error"**
- API server not running
- Wrong API URL
- CORS issue

**"404 Not Found"**
- Wrong endpoint URL
- API route doesn't exist

**"500 Internal Server Error"**
- Database connection issue
- Server-side error (check API terminal)

**"Cannot read property 'data' of undefined"**
- API response structure mismatch
- Check response format

## ✅ Verification

After fixing, verify:

1. Dashboard loads and shows stats
2. Clients page shows client cards
3. Can add new client
4. Can edit existing client
5. Can delete client
6. Search works
7. License filtering works
8. No console errors

If all checks pass, you're good to go! 🎉
