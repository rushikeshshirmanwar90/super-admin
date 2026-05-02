# Admin Dialog Debug Guide

## Current Issue
The admin dialog is not showing admins properly. This is likely because:

1. **Backend API not implemented** - The `/api/admin?clientId={id}` endpoint doesn't exist
2. **API response format mismatch** - The response structure is different than expected
3. **Network/CORS issues** - API calls are being blocked

## Debug Steps

### 1. Check Browser Console
Open browser dev tools (F12) and look for:
- **API Request logs**: `🚀 API Request: GET /api/admin?clientId=...`
- **API Response logs**: `✅ API Response: 200 /api/admin?clientId=...`
- **Error logs**: `❌ API Error:` with details
- **Debug logs**: `🔍 Fetching admins for client:`, `📋 Admin API Response:`, etc.

### 2. Test with Mock Data
I've added mock data fallback when the API returns 404. You should see:
- Toast message: "Showing mock data - implement backend admin endpoints for real data"
- Two mock admins (John Doe, Jane Smith) in the dialog

### 3. Check Network Tab
In browser dev tools Network tab:
- Look for requests to `/api/admin?clientId=...`
- Check the response status (200, 404, 500, etc.)
- Verify the response body format

### 4. Expected API Response Format
Your backend should return:
```json
{
  "success": true,
  "data": [
    {
      "_id": "admin_id_here",
      "firstName": "John",
      "lastName": "Doe", 
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "clientId": "client_id_here",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Quick Test

### Test the Dialog
1. Go to Clients page
2. Click the three-dot menu on any client
3. Click "View Admins"
4. Check browser console for logs
5. Dialog should open with either:
   - Real admin data (if API works)
   - Mock admin data (if API returns 404)
   - Empty state (if API returns empty array)
   - Error message (if API fails)

### Test Admin Creation
1. From the View Admins dialog, click "Add First Admin" or "Add Another Admin"
2. Fill in the form and verify email
3. Create the admin
4. Check if it appears in the dialog

## Backend Implementation Needed

If you see 404 errors, you need to implement these endpoints:

### 1. Get Admins by Client ID
```javascript
// GET /api/admin?clientId={clientId}
app.get('/api/admin', async (req, res) => {
  try {
    const { id, clientId } = req.query;
    
    let query = {};
    if (id) query._id = id;
    if (clientId) query.clientId = clientId;
    
    const admins = await Admin.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
});
```

### 2. Create Admin
```javascript
// POST /api/admin
app.post('/api/admin', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, clientId } = req.body;
    
    const admin = new Admin({
      firstName,
      lastName,
      email,
      phoneNumber,
      clientId
    });
    
    await admin.save();
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin'
    });
  }
});
```

### 3. Delete Admin
```javascript
// DELETE /api/admin?id={adminId}
app.delete('/api/admin', async (req, res) => {
  try {
    const { id } = req.query;
    await Admin.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin'
    });
  }
});
```

## Environment Check

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_API_URL=https://xsite.tech
# or
NEXT_PUBLIC_DOMAIN=https://xsite.tech
```

## Common Issues

### 1. CORS Errors
If you see CORS errors, add to your backend:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'your-frontend-domain'],
  credentials: true
}));
```

### 2. Wrong API Base URL
Check that `NEXT_PUBLIC_API_URL` points to your backend server.

### 3. Database Schema
Make sure your Admin model/collection exists with the correct fields.

## Testing Checklist

- [ ] Dialog opens when clicking "View Admins"
- [ ] Console shows API request logs
- [ ] Either real data, mock data, or empty state appears
- [ ] No JavaScript errors in console
- [ ] "Add Admin" button works from dialog
- [ ] Delete functionality works (for mock or real data)

The dialog should work with mock data even if the backend isn't ready yet!