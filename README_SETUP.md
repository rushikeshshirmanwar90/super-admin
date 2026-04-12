# Super Admin Dashboard

A comprehensive admin dashboard for managing clients and licenses for your real estate platform.

## Features

### 📊 Dashboard
- Real-time statistics (Total Clients, Active Licenses, Expired Licenses, Expiring Soon)
- Recent clients overview
- Expiring licenses alerts
- Quick action buttons

### 👥 Client Management
- View all clients in a beautiful card grid
- Search and filter clients
- Add new clients with license configuration
- Edit existing client information
- Delete clients
- View client details (contact info, location, license status)

### 📜 License Management
- Monitor all client licenses
- Filter by status (All, Active, Expired, Expiring Soon)
- View expiry dates and days remaining
- Visual indicators for license status
- Renew licenses

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/chinmayshrimanwar/Desktop/pamu\ dada/app/super-admin
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Make sure your `real-estate-apis` project is running on port 8080.

### 3. Start the Development Server

```bash
npm run dev
```

The super admin dashboard will be available at `http://localhost:8000`

### 4. Start the Real Estate APIs

In a separate terminal, start your real-estate-apis server:

```bash
cd /Users/chinmayshrimanwar/Desktop/pamu\ dada/app/real-estate-apis
npm run dev
```

This will run on `http://localhost:8080`

## Project Structure

```
super-admin/
├── app/
│   ├── page.tsx                    # Dashboard homepage
│   ├── clients/
│   │   ├── page.tsx               # Clients list
│   │   ├── new/page.tsx           # Add new client
│   │   └── edit/[id]/page.tsx     # Edit client
│   ├── licenses/
│   │   └── page.tsx               # License management
│   └── layout.tsx                 # Root layout with sidebar
├── components/
│   ├── AdminSideBar.tsx           # Navigation sidebar
│   └── ui/                        # Shadcn UI components
├── lib/
│   ├── api.ts                     # API client configuration
│   └── types.ts                   # TypeScript interfaces
└── .env.local                     # Environment variables
```

## API Integration

The dashboard connects to your `real-estate-apis` project using these endpoints:

- `GET /api/client` - Fetch all clients
- `GET /api/client?id={id}` - Fetch single client
- `POST /api/client` - Create new client
- `PUT /api/client?id={id}` - Update client
- `DELETE /api/client?id={id}` - Delete client

## Features Overview

### Dashboard Page (`/`)
- Statistics cards showing key metrics
- Recent clients list
- Expiring licenses alerts
- Quick action buttons

### Clients Page (`/clients`)
- Grid view of all clients
- Search functionality
- Client cards with contact info
- Edit and delete actions
- Add new client button

### Add Client Page (`/clients/new`)
- Form to create new client
- Fields: Name, Email, Phone, City, State, Address
- Optional: Password, Logo URL, License Days
- Automatic license calculation

### Edit Client Page (`/clients/edit/[id]`)
- Pre-filled form with client data
- Update all client information
- Change license status

### License Management Page (`/licenses`)
- Filter licenses by status
- Visual indicators for expiring licenses
- Days remaining calculation
- Renew license functionality

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Toastify

## Color Scheme

- **Primary**: Blue gradient (from-blue-500 to-blue-600)
- **Success**: Green gradient (from-green-500 to-green-600)
- **Warning**: Orange gradient (from-orange-500 to-orange-600)
- **Danger**: Red gradient (from-red-500 to-red-600)
- **Background**: Slate gradient (from-slate-50 to-slate-100)

## Development Tips

1. **Hot Reload**: Both servers support hot reload for development
2. **API Testing**: Use the dashboard to test your API endpoints
3. **Error Handling**: All API calls include error handling with toast notifications
4. **Responsive Design**: The dashboard is fully responsive for mobile, tablet, and desktop

## Troubleshooting

### API Connection Issues
- Ensure `real-estate-apis` is running on port 8080
- Check the `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings in your API

### Port Conflicts
- Super Admin runs on port 8000
- Real Estate APIs runs on port 8080
- Change ports in `package.json` if needed

### Missing Dependencies
```bash
npm install axios react-toastify lucide-react
```

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Role-based access control
- [ ] Advanced filtering and sorting
- [ ] Export data to CSV/Excel
- [ ] Email notifications for expiring licenses
- [ ] Analytics and reporting
- [ ] Bulk operations
- [ ] Activity logs

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
