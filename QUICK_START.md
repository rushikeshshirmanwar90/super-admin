# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd super-admin
npm install
```

### Step 2: Configure API URL
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Step 3: Run Both Servers

**Terminal 1 - Real Estate APIs:**
```bash
cd ../real-estate-apis
npm run dev
# Runs on http://localhost:8080
```

**Terminal 2 - Super Admin:**
```bash
cd ../super-admin
npm run dev
# Runs on http://localhost:8000
```

## 📱 Access the Dashboard

Open your browser and navigate to:
```
http://localhost:8000
```

## 🎯 What You Can Do

### Dashboard (/)
- View statistics: Total clients, active licenses, expired licenses
- See recent clients
- Monitor expiring licenses
- Quick access to all features

### Manage Clients (/clients)
- View all clients in a grid
- Search by name, email, or city
- Add new clients
- Edit client information
- Delete clients

### License Management (/licenses)
- Filter by: All, Active, Expired, Expiring Soon
- View expiry dates
- See days remaining
- Renew licenses

## 🔧 API Endpoints Used

The dashboard uses these endpoints from your real-estate-apis:

```
GET    /api/client           # Get all clients
GET    /api/client?id={id}   # Get single client
POST   /api/client           # Create client
PUT    /api/client?id={id}   # Update client
DELETE /api/client?id={id}   # Delete client
```

## 📝 Adding a New Client

1. Click "Add Client" button
2. Fill in required fields:
   - Name
   - Email
   - Phone Number
   - City
   - State
   - Address
3. Optional fields:
   - Password
   - Logo URL
   - License Days (e.g., 365 for 1 year)
4. Click "Create Client"

## 🎨 Features

✅ Modern, responsive design
✅ Real-time data updates
✅ Search and filter functionality
✅ Toast notifications
✅ License expiry tracking
✅ Beautiful UI with Tailwind CSS
✅ Type-safe with TypeScript

## 🐛 Common Issues

**Issue**: API connection failed
**Solution**: Make sure real-estate-apis is running on port 8080

**Issue**: Port already in use
**Solution**: Change port in package.json:
```json
"dev": "next dev -p 8001"
```

**Issue**: Environment variables not working
**Solution**: Restart the dev server after changing .env.local

## 📚 Next Steps

1. Customize the sidebar branding
2. Add authentication
3. Configure email notifications
4. Set up production deployment
5. Add more features as needed

## 💡 Tips

- Use the search bar to quickly find clients
- Filter licenses to see which ones need renewal
- The dashboard auto-refreshes data
- All forms include validation
- Toast notifications confirm actions

Enjoy your new Super Admin Dashboard! 🎉
