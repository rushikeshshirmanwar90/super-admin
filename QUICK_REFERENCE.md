# Quick Reference Card

## 🚀 Start Servers

```bash
# Terminal 1 - API Server
cd real-estate-apis
npm run dev
# → http://localhost:8080

# Terminal 2 - Super Admin
cd super-admin
npm run dev
# → http://localhost:8000
```

## 🔗 URLs

| Page | URL |
|------|-----|
| Dashboard | http://localhost:8000 |
| Clients | http://localhost:8000/clients |
| Add Client | http://localhost:8000/clients/new |
| Licenses | http://localhost:8000/licenses |
| API | http://localhost:8080/api/client |

## 🧪 Quick Tests

```bash
# Test API connection
node test-connection.js

# Run diagnostics
bash diagnose.sh

# Test API directly
curl http://localhost:8080/api/client
```

## 📊 API Response Format

```json
{
  "success": true,
  "message": "...",
  "data": [...]
}
```

## 💻 Code Pattern

```javascript
// Fetch data
const response = await clientAPI.getAll()
const clients = response.data.data  // ✅ Correct

// Handle errors
try {
  // API call
} catch (error) {
  console.error('Error:', error)
  toast.error('Failed')
}
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Can't fetch data | Check both servers running |
| CORS error | Add CORS headers to API |
| 404 error | Verify API URL in .env.local |
| No data shows | Add test clients |
| Port in use | Kill process: `kill -9 $(lsof -ti:8000)` |

## 🔧 Quick Fixes

```bash
# Restart servers
Ctrl+C (stop)
npm run dev (start)

# Clear cache
Ctrl+Shift+R (browser)

# Reinstall dependencies
rm -rf node_modules
npm install

# Reset environment
cp .env.example .env.local
```

## 📝 Add Test Client

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

## 🎯 Verification

- [ ] Both servers running
- [ ] API returns data
- [ ] Dashboard shows stats
- [ ] Clients display
- [ ] No console errors

## 📚 Documentation

- `FIX_SUMMARY.md` - What was fixed
- `TROUBLESHOOTING.md` - Detailed help
- `QUICK_START.md` - Getting started
- `FIXES_APPLIED.md` - Complete fixes

## 💡 Pro Tips

1. Always check browser console (F12)
2. Test API directly first
3. Restart servers after .env changes
4. Use Network tab to debug
5. Run diagnostics when stuck

## 🎉 Success Check

✅ Dashboard loads
✅ Stats show numbers
✅ Clients display
✅ CRUD works
✅ No errors

---

**Need help?** Run `bash diagnose.sh` or check `TROUBLESHOOTING.md`
