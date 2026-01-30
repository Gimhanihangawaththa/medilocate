# MediLocate Backend API Documentation

## Overview
MediLocate is a production-ready backend system that helps users find nearby pharmacies with specific medicines in stock. The system supports real-time inventory management, geolocation-based pharmacy searches, and secure JWT authentication for pharmacy admins.

---

## Architecture

### Directory Structure
```
backend/
├── app.js                          # Main application entry
├── package.json                    # Dependencies
├── .env                           # Environment variables
├── Dockerfile                     # Docker configuration
├── src/
│   ├── models/                    # MongoDB schemas
│   │   ├── User.js                # Regular user model
│   │   ├── Admin.js               # Pharmacy admin model
│   │   ├── Pharmacy.js            # Pharmacy model with geolocation
│   │   ├── Medicine.js            # Medicine catalog model
│   │   └── Inventory.js           # Stock inventory model
│   ├── controllers/               # Business logic
│   │   ├── authController.js      # Auth logic for users and admins
│   │   ├── pharmacyController.js  # Pharmacy CRUD and search
│   │   ├── medicineController.js  # Medicine catalog management
│   │   └── inventoryController.js # Inventory and availability
│   ├── routes/                    # API endpoints
│   │   ├── auth.js                # /api/auth routes
│   │   ├── pharmacies.js          # /api/pharmacies routes
│   │   ├── medicines.js           # /api/medicines routes
│   │   └── inventory.js           # /api/inventory routes
│   └── middleware/
│       ├── auth.js                # JWT authentication & role-based access
│       ├── errorHandler.js        # Global error handling
│       ├── rateLimiter.js         # Rate limiting for security
│       └── validation.js          # Input validation
└── README.md                      # Documentation
```

### Technology Stack
- **Node.js & Express.js**: REST API framework
- **MongoDB**: NoSQL database with geospatial indexing
- **JWT**: Secure authentication
- **Bcryptjs**: Password hashing
- **Express Rate Limit**: API rate limiting
- **Joi**: Data validation (optional)

---

## Database Design

### 1. User Schema (Customers)
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String,
  phone: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Admin Schema (Pharmacy Owners)
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum['pharmacy_admin', 'system_admin'],
  pharmacy: ObjectId (ref: Pharmacy),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Pharmacy Schema
```javascript
{
  name: String (required),
  registrationNumber: String (unique, required),
  address: {
    street: String (required),
    city: String (required),
    state: String (required),
    postalCode: String (required)
  },
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]  // GeoJSON format
  },
  contact: {
    phone: String (required, validated),
    email: String,
    website: String
  },
  owner: ObjectId (ref: Admin, required),
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    // ... other days
  },
  isActive: Boolean (default: true),
  rating: Number (0-5, default: 0),
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes**: Geospatial (2dsphere), text search, isActive

### 4. Medicine Schema
```javascript
{
  name: String (unique, required),
  genericName: String,
  category: Enum['Antibiotic', 'Painkiller', 'Vitamin', ...],
  description: String (max 500 chars),
  manufacturer: String,
  strength: String,
  unit: Enum['mg', 'ml', 'g', 'tablet', ...],
  requiresPrescription: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes**: Text search (name, genericName, description), category

### 5. Inventory Schema (Stock at Each Pharmacy)
```javascript
{
  pharmacy: ObjectId (ref: Pharmacy, required),
  medicine: ObjectId (ref: Medicine, required),
  quantity: Number (required, min: 0),
  price: Number (required, min: 0),
  batchNumber: String,
  expiryDate: Date (required),
  lastRestocked: Date,
  status: Enum['in_stock', 'low_stock', 'out_of_stock'],
  lowStockThreshold: Number (default: 5),
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes**: Unique (pharmacy, medicine), status, expiryDate

---

## API Endpoints

### Authentication Endpoints

#### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "fullName": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

#### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### 3. Pharmacy Admin Registration
```
POST /api/auth/admin/register
Content-Type: application/json

Request:
{
  "username": "pharmacy_admin",
  "email": "admin@pharmacy.com",
  "password": "adminpass123",
  "pharmacyId": "optional_pharmacy_id"
}

Response (201):
{
  "success": true,
  "message": "Pharmacy admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "username": "pharmacy_admin",
    "email": "admin@pharmacy.com",
    "role": "pharmacy_admin"
  }
}
```

#### 4. Pharmacy Admin Login
```
POST /api/auth/admin/login
Content-Type: application/json

Request:
{
  "email": "admin@pharmacy.com",
  "password": "adminpass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "username": "pharmacy_admin",
    "email": "admin@pharmacy.com",
    "role": "pharmacy_admin"
  }
}
```

---

### Pharmacy Endpoints

#### 1. Get All Pharmacies (Public)
```
GET /api/pharmacies?page=1&limit=20

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i",
      "name": "Health Plus Pharmacy",
      "registrationNumber": "REG123456",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001"
      },
      "contact": {
        "phone": "+12125551234",
        "email": "contact@healthplus.com"
      },
      "location": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      },
      "rating": 4.5,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### 2. Search Pharmacies by Location (Public)
```
GET /api/pharmacies/search?latitude=40.7128&longitude=-74.0060&maxDistance=5000&page=1&limit=20

Query Parameters:
- latitude: User's latitude (required)
- longitude: User's longitude (required)
- maxDistance: Search radius in meters (default: 5000)
- page: Page number (default: 1)
- limit: Results per page (default: 20)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i",
      "name": "Near You Pharmacy",
      "address": {...},
      "contact": {...},
      "location": {...},
      "distance": 1200  // meters from user
    }
  ],
  "pagination": {...}
}
```

#### 3. Get Pharmacy Details (Public)
```
GET /api/pharmacies/:pharmacyId

Response (200):
{
  "success": true,
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i",
    "name": "Health Plus Pharmacy",
    "operatingHours": {
      "monday": { "open": "08:00", "close": "20:00", "closed": false },
      "tuesday": { "open": "08:00", "close": "20:00", "closed": false },
      // ...
    },
    "owner": {
      "_id": "admin_id",
      "email": "admin@healthplus.com"
    }
  }
}
```

#### 4. Create Pharmacy (Pharmacy Admin)
```
POST /api/pharmacies
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "MedCare Pharmacy",
  "registrationNumber": "REG789012",
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "postalCode": "02101"
  },
  "location": {
    "coordinates": [-71.0596, 42.3601]
  },
  "contact": {
    "phone": "+16175551234",
    "email": "contact@medcare.com",
    "website": "https://medcare.com"
  },
  "operatingHours": {
    "monday": { "open": "07:00", "close": "21:00", "closed": false },
    "sunday": { "open": "10:00", "close": "18:00", "closed": false }
  }
}

Response (201):
{
  "success": true,
  "message": "Pharmacy created successfully",
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i",
    ...
  }
}
```

#### 5. Update Pharmacy (Pharmacy Admin - Owner Only)
```
PUT /api/pharmacies/:pharmacyId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "contact": {
    "phone": "+16175555678"
  },
  "operatingHours": {
    "monday": { "open": "08:00", "close": "21:00", "closed": false }
  }
}

Response (200):
{
  "success": true,
  "message": "Pharmacy updated successfully",
  "data": {...}
}
```

#### 6. Delete Pharmacy (Soft Delete - Pharmacy Admin)
```
DELETE /api/pharmacies/:pharmacyId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Pharmacy deleted successfully"
}
```

---

### Medicine Endpoints

#### 1. Search Medicines (Public)
```
GET /api/medicines/search?query=aspirin&category=Painkiller&page=1&limit=20

Query Parameters:
- query: Medicine name (min 2 chars, required)
- category: Category filter (optional)
- page: Page number (default: 1)
- limit: Results per page (default: 20)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i",
      "name": "Aspirin 500mg",
      "genericName": "Acetylsalicylic acid",
      "category": "Painkiller",
      "description": "Pain relief tablet",
      "manufacturer": "Bayer",
      "strength": "500",
      "unit": "mg",
      "requiresPrescription": false
    }
  ],
  "pagination": {...}
}
```

#### 2. Get All Medicines (Public)
```
GET /api/medicines?category=Antibiotic&page=1&limit=20

Response (200):
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

#### 3. Get Medicine Details (Public)
```
GET /api/medicines/:medicineId

Response (200):
{
  "success": true,
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i",
    "name": "Aspirin 500mg",
    ...
  }
}
```

#### 4. Add Medicine (System Admin Only)
```
POST /api/medicines
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "name": "Ibuprofen 200mg",
  "genericName": "Ibuprofen",
  "category": "Painkiller",
  "description": "Anti-inflammatory pain reliever",
  "manufacturer": "Pfizer",
  "strength": "200",
  "unit": "mg",
  "requiresPrescription": false
}

Response (201):
{
  "success": true,
  "message": "Medicine added successfully",
  "data": {...}
}
```

#### 5. Update Medicine (System Admin)
```
PUT /api/medicines/:medicineId
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "description": "Updated description",
  "manufacturer": "New Manufacturer"
}

Response (200):
{
  "success": true,
  "message": "Medicine updated successfully",
  "data": {...}
}
```

#### 6. Delete Medicine (Soft Delete - System Admin)
```
DELETE /api/medicines/:medicineId
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "Medicine deleted successfully"
}
```

---

### Inventory & Availability Endpoints

#### 1. Add Medicine to Pharmacy Inventory (Pharmacy Admin)
```
POST /api/inventory/:pharmacyId/medicines
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "medicineId": "650a1b2c3d4e5f6g7h8i",
  "quantity": 150,
  "price": 5.99,
  "batchNumber": "BATCH-2024-001",
  "expiryDate": "2025-12-31",
  "lowStockThreshold": 20
}

Response (201):
{
  "success": true,
  "message": "Inventory added successfully",
  "data": {
    "_id": "inventory_id",
    "pharmacy": "pharmacy_id",
    "medicine": "medicine_id",
    "quantity": 150,
    "price": 5.99,
    "status": "in_stock",
    "expiryDate": "2025-12-31"
  }
}
```

#### 2. Get Pharmacy Inventory (Pharmacy Admin)
```
GET /api/inventory/:pharmacyId?status=in_stock&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- status: Filter by status ('in_stock', 'low_stock', 'out_of_stock')
- page: Page number
- limit: Results per page

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "inventory_id",
      "medicine": {
        "_id": "medicine_id",
        "name": "Aspirin 500mg",
        "category": "Painkiller",
        "strength": "500",
        "unit": "mg"
      },
      "quantity": 150,
      "price": 5.99,
      "status": "in_stock",
      "expiryDate": "2025-12-31"
    }
  ],
  "pagination": {...}
}
```

#### 3. Search Medicine Availability (Public)
```
GET /api/inventory/search/availability?medicineId=650a1b2c3d4e5f6g7h8i&latitude=40.7128&longitude=-74.0060&maxDistance=5000&page=1

Query Parameters:
- medicineId: Medicine to search for (required)
- latitude: User latitude (optional)
- longitude: User longitude (optional)
- maxDistance: Search radius in meters (default: 5000)
- page: Page number
- limit: Results per page

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "inventory_id",
      "pharmacy": {
        "_id": "pharmacy_id",
        "name": "Health Plus Pharmacy",
        "address": {...},
        "contact": {...},
        "location": {...},
        "rating": 4.5
      },
      "medicine": {
        "_id": "medicine_id",
        "name": "Aspirin 500mg",
        "category": "Painkiller"
      },
      "quantity": 150,
      "price": 5.99,
      "status": "in_stock"
    }
  ],
  "pagination": {...}
}
```

#### 4. Update Inventory (Pharmacy Admin)
```
PUT /api/inventory/:pharmacyId/medicines/:inventoryId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "quantity": 200,
  "price": 5.50
}

Response (200):
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {...}
}
```

#### 5. Remove Medicine from Inventory (Pharmacy Admin)
```
DELETE /api/inventory/:pharmacyId/medicines/:inventoryId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Inventory removed successfully"
}
```

---

## Error Handling

All errors return consistent response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Optional detailed errors array"]
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Authentication & Authorization

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles
- **user**: Regular customer (read-only access to medicines and pharmacies)
- **pharmacy_admin**: Manages single pharmacy inventory
- **system_admin**: Manages medicines and admins

---

## Rate Limiting

- **General limit**: 100 requests per 15 minutes per IP
- **Auth limit**: 5 requests per 15 minutes per IP
- **Search limit**: 30 requests per minute per IP

---

## Environment Variables (.env)

```
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/medilocate
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
```

---

## Deployment

### Docker
```bash
docker build -t medilocate-backend .
docker run -d -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongodb:27017/medilocate \
  -e JWT_SECRET=your_secret_key \
  medilocate-backend
```

### Docker Compose
```bash
docker-compose up -d
```

---

## Testing API Endpoints

### Using curl

**Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Search Medicines**
```bash
curl "http://localhost:5000/api/medicines/search?query=aspirin"
```

**Search Nearby Pharmacies**
```bash
curl "http://localhost:5000/api/pharmacies/search?latitude=40.7128&longitude=-74.0060&maxDistance=5000"
```

---

## Future Enhancements

1. **Advanced Search**: Fuzzy search, filters by price range, rating
2. **Reviews & Ratings**: User reviews for pharmacies
3. **Prescriptions**: Digital prescription validation
4. **Notifications**: Push notifications for stock updates
5. **Analytics**: Dashboard for pharmacy owners
6. **API Versioning**: Support multiple API versions
7. **Caching**: Redis caching for frequently accessed data
8. **WebSockets**: Real-time inventory updates
9. **Payment Integration**: Online ordering and payment
10. **Mobile App**: Dedicated mobile applications

---

## Support

For issues, questions, or suggestions, please contact the development team.
