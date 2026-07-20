# 🔧 Connection Error Fix - Complete Solution

## Problem
Your super-admin frontend (port 8000) cannot connect to the backend API (port 8080) because the backend server is not running.

**Error:** `GET http://localhost:8080/api/clients net::ERR_CONNECTION_REFUSED`

---

## ✅ Solution: Start Both Servers

### Step 1: Start the Backend API (Port 8080)

Open a **new terminal** and run:

```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/real-estate-apis"
npm run dev
```

**Expected output:**
```
✓ Ready on http://localhost:8080
```

### Step 2: Start the Frontend (Port 8000)

Open **another terminal** and run:

```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/super-admin"
npm run dev
```

**Expected output:**
```
✓ Ready on http://localhost:8000
```

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:8000
```

---

## 🔍 Verification Checklist

### Backend is Running (Port 8080)
- [ ] Terminal shows "Ready on http://localhost:8080"
- [ ] Visit http://localhost:8080 in browser (should show something)
- [ ] No error messages in backend terminal

### Frontend is Running (Port 8000)
- [ ] Terminal shows "Ready on http://localhost:8000"
- [ ] Visit http://localhost:8000 in browser
- [ ] No "ERR_CONNECTION_REFUSED" errors in browser console

### API Connection Working
- [ ] Dashboard loads data successfully
- [ ] No network errors in browser console (F12 → Console tab)
- [ ] API requests show 200 status codes (F12 → Network tab)

---

## 🚨 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:** `Port 8080 is already in use`

**Solution:**
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9

# Or use a different port
npm run dev -- -p 8081
```

Then update `.env` in super-admin:
```env
NEXT_PUBLIC_DOMAIN=http://localhost:8081
```

### Issue 2: MongoDB Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:**
Check the backend `.env` file has correct MongoDB credentials:
```bash
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/real-estate-apis"
cat .env | grep DB_URL
```

### Issue 3: Missing Dependencies

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# In backend folder
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/real-estate-apis"
npm install

# In frontend folder
cd "/Users/chinmayshrimanwar/Desktop/pamu dada/app/super-admin"
npm install
```

### Issue 4: Bearer Token Mismatch

**Error:** `401 Unauthorized`

**Solution:**
Ensure both `.env` files have the same bearer token:

**Backend** (`real-estate-apis/.env`):
```env
API_BEARER_TOKEN=eyJhbGciOiJIUIsInRbaDas2344rr308ohagn0wer4XVCJ9.
```

**Frontend** (`super-admin/.env`):
```env
NEXT_PUBLIC_BEARER_TOKEN=eyJhbGciOiJIUIsInRbaDas2344rr308ohagn0wer4XVCJ9.
```

---

## 📝 Quick Start Script

Save this as `start-all.sh` in `/Users/chinmayshrimanwar/Desktop/pamu dada/app/`:

```bash
#!/bin/bash

echo "🚀 Starting Backend API (Port 8080)..."
cd "real-estate-apis"
npm run dev &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🚀 Starting Frontend (Port 8000)..."
cd "../super-admin"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo "📍 Backend:  http://localhost:8080"
echo "📍 Frontend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
```

Make it executable and run:
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## 🔧 Manual Testing

### Test Backend API Directly

```bash
# Test if backend is responding
curl http://localhost:8080/api/clients \
  -H "Authorization: Bearer eyJhbGciOiJIUIsInRbaDas2344rr308ohagn0wer4XVCJ9."
```

**Expected:** JSON response with client data or error message (not connection refused)

### Test Frontend API Call

Open browser console (F12) on http://localhost:8000 and run:
```javascript
fetch('http://localhost:8080/api/clients', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUIsInRbaDas2344rr308ohagn0wer4XVCJ9.'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│  Browser (http://localhost:8000)       │
│  Super Admin Frontend (Next.js)        │
└──────────────┬──────────────────────────┘
               │ API Calls
               ▼
┌─────────────────────────────────────────┐
│  Backend API (http://localhost:8080)    │
│  Real Estate APIs (Next.js API Routes)  │
└──────────────┬──────────────────────────┘
               │ Database Queries
               ▼
┌─────────────────────────────────────────┐
│  MongoDB Atlas (Cloud Database)         │
└─────────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. ✅ Start backend server (port 8080)
2. ✅ Start frontend server (port 8000)
3. ✅ Open http://localhost:8000 in browser
4. ✅ Verify no connection errors
5. ✅ Test dashboard functionality

---

## 📞 Still Having Issues?

If you're still seeing errors:

1. **Check both terminal windows** for error messages
2. **Check browser console** (F12 → Console) for errors
3. **Verify environment variables** in both `.env` files
4. **Restart both servers** completely
5. **Clear browser cache** and reload

---

## 🔐 Security Note

The bearer token in your `.env` files should be kept secret. Never commit these files to Git or share them publicly.

---

**Last Updated:** $(date)
