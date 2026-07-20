# ⚡ QUICK FIX - Connection Error

## The Problem
❌ **Backend API is not running** → Frontend can't connect

## The Solution (Choose One)

### Option 1: Use the Auto-Start Script (Easiest)
```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app"
./start-all.sh
```

### Option 2: Start Manually (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/real-estate-apis"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/super-admin"
npm run dev
```

## ✅ Success Indicators

- Backend terminal shows: `✓ Ready on http://localhost:8080`
- Frontend terminal shows: `✓ Ready on http://localhost:8000`
- Browser at http://localhost:8000 loads without errors
- No "ERR_CONNECTION_REFUSED" in browser console

## 🔍 Quick Test

Open http://localhost:8000 in your browser. If you see the dashboard loading data, you're good to go!

## 🚨 Still Not Working?

1. Check if ports are already in use:
   ```bash
   lsof -i :8080
   lsof -i :8000
   ```

2. Kill any existing processes:
   ```bash
   lsof -ti:8080 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

3. Try again with the start script

---

**Need more details?** See `CONNECTION_ERROR_FIX.md` for complete documentation.
