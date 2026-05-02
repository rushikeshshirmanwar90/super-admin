# Admin Management API Endpoints

This document outlines the API endpoints needed for the admin management functionality in your super-admin dashboard.

## Base URL
All endpoints should be prefixed with your API base URL: `https://xsite.tech/api`

## Admin Endpoints

### 1. Get All Admins
**GET** `/api/admin`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "admin_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "1234567890",
      "clientId": "client_id_here",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Admin by ID
**GET** `/api/admin?id={admin_id}`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "admin_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "clientId": "client_id_here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get Admins by Client ID
**GET** `/api/admin?clientId={client_id}`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "admin_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "1234567890",
      "clientId": "client_id_here",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. Create New Admin
**POST** `/api/admin`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "clientId": "client_id_here"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "new_admin_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "clientId": "client_id_here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Admin created successfully"
}
```

### 5. Update Admin
**PUT** `/api/admin?id={admin_id}`

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "john.updated@example.com",
  "phoneNumber": "0987654321",
  "clientId": "new_client_id_here"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "admin_id_here",
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.updated@example.com",
    "phoneNumber": "0987654321",
    "clientId": "new_client_id_here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Admin updated successfully"
}
```

### 6. Delete Admin
**DELETE** `/api/admin?id={admin_id}`

**Response Format:**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

## Error Response Format

All endpoints should return errors in this format:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error information (optional)"
}
```

## Database Schema

### Admin Collection/Table Structure:
```javascript
{
  _id: ObjectId, // MongoDB ID or equivalent
  firstName: String, // Required
  lastName: String, // Required
  email: String, // Required, unique
  phoneNumber: String, // Required
  clientId: ObjectId, // Required, reference to Client
  createdAt: Date, // Auto-generated
  updatedAt: Date, // Auto-generated on updates
}
```

## Implementation Notes

1. **Validation**: Ensure email validation and uniqueness
2. **Client Relationship**: Verify that the clientId exists before creating/updating an admin
3. **Error Handling**: Return appropriate HTTP status codes (400 for bad requests, 404 for not found, 500 for server errors)
4. **Security**: Consider adding authentication/authorization middleware
5. **Pagination**: For large datasets, consider adding pagination to the GET all admins endpoint

## Example Implementation (Node.js/Express with MongoDB)

```javascript
// GET /api/admin
app.get('/api/admin', async (req, res) => {
  try {
    const { id, clientId } = req.query;
    
    let query = {};
    if (id) query._id = id;
    if (clientId) query.clientId = clientId;
    
    const admins = await Admin.find(query).sort({ createdAt: -1 });
    
    if (id && admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: id ? admins[0] : admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
});

// POST /api/admin
app.post('/api/admin', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, clientId } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    const admin = new Admin({
      firstName,
      lastName,
      email,
      phoneNumber,
      clientId
    });
    
    await admin.save();
    
    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
});
```

This API structure matches the frontend implementation and provides all the necessary endpoints for admin management functionality.