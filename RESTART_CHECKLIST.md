# 🔄 Restart Checklist - Fix ERR_NETWORK Error

## ⚡ Quick Fix (Do This Now!)

### Step 1: Stop Current Server
```bash
# In your super-admin terminal, press:
Ctrl+C
```

### Step 2: Verify Environment Variable
```bash
# Check .env.local file contains:
cat .env.local
```

Should show:
```
NEXT_PUBLIC_API_URL=https://xsite.tech
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Clear Browser Cache
- Press `Ctrl+Shift+R` (Windows/Linux)
- Or `Cmd+Shift+R` (Mac)

### Step 5: Check Console
Open browser console (F12) and look for:
```
🌐 API Base URL: https://xsite.tech
```

If you see `http://localhost:8080`, the environment variable didn't load. Go back to Step 1.

## ✅ Verification

### Test 1: Check API URL in Console
Open browser console and type:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

Should show: `https://xsite.tech`

### Test 2: Test API Directly
Open in browser:
```
https://xsite.tech/api/client
```

Should return JSON data.

### Test 3: Check Dashboard
Open:
```
http://localhost:8000
```

Should load data without errors.

## 🐛 If Still Not Working

### Issue: Still shows localhost

**Solution:**
1. Make sure you stopped the server (Ctrl+C)
2. Check `.env.local` file is in the root of super-admin folder
3. Restart server: `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R

### Issue: CORS Error

**Solution:**
1. Update `real-estate-apis/next.config.ts` (already done)
2. Redeploy your API to production
3. Wait for deployment to complete
4. Try again

### Issue: API Not Accessible

**Solution:**
1. Test in browser: `https://xsite.tech/api/client`
2. If it doesn't work, your API might be down
3. Check your hosting platform (Vercel, etc.)

## 📋 Complete Checklist

- [ ] Stopped super-admin server (Ctrl+C)
- [ ] Verified `.env.local` has `NEXT_PUBLIC_API_URL=https://xsite.tech`
- [ ] Restarted server with `npm run dev`
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Console shows correct API URL
- [ ] API accessible in browser
- [ ] Dashboard loads without errors
- [ ] Data displays correctly

## 🎯 Expected Result

After following these steps, you should see:

**In Console:**
```
🌐 API Base URL: https://xsite.tech
🚀 API Request: GET /api/client
✅ API Response: 200 /api/client
```

**In Dashboard:**
- Statistics with real numbers
- Client cards with data
- No error messages

## 🚀 Quick Test Command

Run this to test production API:
```bash
node test-production.js
```

Should show:
```
✅ API is reachable!
✅ CORS headers present
✅ Found X client(s)
```

## 💡 Remember

**ALWAYS restart the server after changing `.env.local`!**

Environment variables are loaded when the server starts, not dynamically.

---

**Need help?** Check `PRODUCTION_SETUP.md` for detailed guide.
