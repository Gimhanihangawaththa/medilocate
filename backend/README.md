# MediLocate Backend - Complete Implementation

A production-ready Node.js/Express backend system for finding medicines in nearby pharmacies with real-time inventory management, geolocation search, and JWT authentication.

## ✨ Features

✅ **User Authentication**
- User registration and login
- Pharmacy admin registration and login
- Role-based access control (Regular User, Pharmacy Admin, System Admin)
- JWT token-based authentication
- Secure password hashing with bcryptjs

✅ **Pharmacy Management**
- Pharmacy CRUD operations
- Geolocation-based pharmacy search (nearest first)
- Operating hours management
- Pharmacy ratings and reviews support
- Soft delete for data preservation

✅ **Medicine Catalog**
- Complete medicine database with categories
- Text-based search with partial matching
- Medicine metadata (generic name, manufacturer, strength, unit)
- Prescription requirement tracking
- System admin management

✅ **Inventory Management**
- Real-time stock levels per pharmacy
- Automatic stock status tracking (in_stock, low_stock, out_of_stock)
- Batch and expiry date tracking
- Low stock threshold alerts
- Medicine availability search across pharmacies

✅ **Advanced Features**
- **Geospatial Queries**: MongoDB 2dsphere indexing for accurate location-based searches
- **Text Indexing**: Fast full-text search on medicines and pharmacies
- **Rate Limiting**: API protection against abuse (100 req/15min general, 5 req/15min auth)
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Validation**: Input validation and sanitization
- **CORS**: Configured for frontend integration

✅ **Scalability**
- Proper database indexing for fast queries
- Pagination for large datasets
- Connection pooling (MongoDB)
- Efficient query optimization

---

## 🏗️ Architecture

### MVC/Layered Design
```
Models (Database layer)
   ↓
Controllers (Business logic)
   ↓
Routes (API endpoints)
   ↓
Middleware (Cross-cutting concerns)
```

### Database Schema Relationships
```
User (1) ──→ (Many) Pharmacy ──→ (Many) Inventory ←─ (Many) Medicine
Admin (1) ──→ (Many) Pharmacy
Admin (1) ──→ (Many) Inventory
```

---

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm
- MongoDB 4.4+ (local or Docker)
- Docker & Docker Compose (for containerized setup)

### Setup Steps

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medilocate
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
EOF
```

4. **Start MongoDB** (if running locally)
```bash
mongod --dbpath ./data
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Verify health endpoint**
```bash
curl http://localhost:5000/api/health
```

---

## 🐳 Docker Setup

### Using Docker

1. **Build image**
```bash
docker build -t medilocate-backend .
```

2. **Run with MongoDB**
```bash
# Create network
docker network create medilocate-net

# Run MongoDB
docker run -d --name mongodb --network medilocate-net \
  -p 27017:27017 -v mongo-data:/data/db mongo:6

# Run backend
docker run -d --name backend --network medilocate-net \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://mongodb:27017/medilocate" \
  -e JWT_SECRET="change_this_key" \
  medilocate-backend
```

### Using Docker Compose

```bash
docker-compose up -d
```

---

## 🚀 Quick Start Examples

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123",
    "fullName": "John Doe"
  }'
```

### 2. Register Pharmacy Admin
```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_john",
    "email": "admin@pharmacy.com",
    "password": "adminpass123"
  }'
```

### 3. Create Pharmacy
```bash
curl -X POST http://localhost:5000/api/pharmacies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "MedCare Pharmacy",
    "registrationNumber": "REG123456",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "location": {
      "coordinates": [-74.0060, 40.7128]
    },
    "contact": {
      "phone": "+12125551234",
      "email": "contact@medcare.com"
    }
  }'
```

### 4. Search Nearby Pharmacies
```bash
curl "http://localhost:5000/api/pharmacies/search?latitude=40.7128&longitude=-74.0060&maxDistance=5000"
```

### 5. Search Medicines
```bash
curl "http://localhost:5000/api/medicines/search?query=aspirin"
```

### 6. Add Inventory
```bash
curl -X POST http://localhost:5000/api/inventory/PHARMACY_ID/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "medicineId": "MEDICINE_ID",
    "quantity": 150,
    "price": 5.99,
    "batchNumber": "BATCH-001",
    "expiryDate": "2025-12-31"
  }'
```

### 7. Search Medicine Availability
```bash
curl "http://localhost:5000/api/inventory/search/availability?medicineId=MEDICINE_ID&latitude=40.7128&longitude=-74.0060"
```

---

## 📚 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/register` | Admin registration |
| POST | `/api/auth/admin/login` | Admin login |

### Pharmacies
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pharmacies` | Get all pharmacies | ❌ |
| GET | `/api/pharmacies/:id` | Get pharmacy details | ❌ |
| GET | `/api/pharmacies/search` | Search nearby pharmacies | ❌ |
| POST | `/api/pharmacies` | Create pharmacy | ✅ |
| PUT | `/api/pharmacies/:id` | Update pharmacy | ✅ |
| DELETE | `/api/pharmacies/:id` | Delete pharmacy | ✅ |

### Medicines
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/medicines` | Get all medicines | ❌ |
| GET | `/api/medicines/:id` | Get medicine details | ❌ |
| GET | `/api/medicines/search` | Search medicines | ❌ |
| POST | `/api/medicines` | Add medicine | ✅ System Admin |
| PUT | `/api/medicines/:id` | Update medicine | ✅ System Admin |
| DELETE | `/api/medicines/:id` | Delete medicine | ✅ System Admin |

### Inventory
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/inventory/:pharmacyId/medicines` | Add to inventory | ✅ |
| GET | `/api/inventory/:pharmacyId` | Get pharmacy inventory | ✅ |
| GET | `/api/inventory/search/availability` | Search availability | ❌ |
| PUT | `/api/inventory/:pharmacyId/medicines/:inventoryId` | Update inventory | ✅ |
| DELETE | `/api/inventory/:pharmacyId/medicines/:inventoryId` | Remove from inventory | ✅ |

---

## 🔐 Security Best Practices Implemented

✅ **Authentication**
- JWT tokens with expiration
- Secure password hashing (bcryptjs with salt rounds)
- Role-based access control

✅ **Input Validation**
- Mongoose schema validation
- Email format validation
- Phone number validation
- Geolocation coordinate validation

✅ **Rate Limiting**
- General API rate limiting
- Stricter auth endpoint limits
- Search request limiting

✅ **Error Handling**
- No sensitive data in error messages
- Proper HTTP status codes
- Validation error details

✅ **Database**
- Indexes for query optimization
- Compound indexes for unique constraints
- Geospatial indexing

---

## 📊 Database Indexes

```javascript
// Medicine indexes
{ name: 'text', genericName: 'text', description: 'text' }
{ category: 1 }

// Pharmacy indexes
{ location: '2dsphere' }  // Geospatial
{ name: 'text', 'address.city': 'text' }
{ isActive: 1 }

// Inventory indexes
{ pharmacy: 1, medicine: 1 }  // Unique compound index
{ status: 1 }
{ expiryDate: 1 }
```

---

## 🧪 Testing Checklist

- [ ] User registration and login working
- [ ] Pharmacy admin creation and authentication
- [ ] Pharmacy CRUD operations
- [ ] Medicine search functionality
- [ ] Geolocation-based pharmacy search
- [ ] Inventory management
- [ ] Medicine availability search
- [ ] Error handling for invalid inputs
- [ ] Rate limiting enforcement
- [ ] Token expiration handling

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running. For Docker: `docker run -d -p 27017:27017 mongo:6`

### Token Verification Failed
```
Error: Invalid or expired token
```
**Solution**: Ensure JWT_SECRET in .env matches the one used to generate tokens

### Geolocation Search Not Working
```
Error: cannot use $near with a non-GeoJSON object
```
**Solution**: Ensure coordinates are in [longitude, latitude] format and indexes are created

### Rate Limit Exceeded
```
Error: Too many requests from this IP
```
**Solution**: Wait 15 minutes or use different IP address for testing

---

## 📈 Performance Optimization

1. **Database Indexing**: All frequently queried fields are indexed
2. **Pagination**: Implemented to handle large datasets
3. **Geospatial Queries**: Optimized with 2dsphere indexes
4. **Text Search**: MongoDB text indexes for fast searches
5. **Connection Pooling**: MongoDB connection reuse
6. **Rate Limiting**: Prevents resource exhaustion

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET in environment variables
- [ ] Configure MongoDB with authentication
- [ ] Enable HTTPS/TLS for API
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your frontend domain
- [ ] Set up logging and monitoring
- [ ] Enable database backups
- [ ] Configure rate limiting appropriately
- [ ] Use environment-specific variables
- [ ] Set up health check endpoint monitoring

---

## 📝 Project Structure Explanation

### Models (`/src/models`)
Define database schemas with validation rules

### Controllers (`/src/controllers`)
Implement business logic separate from routes

### Routes (`/src/routes`)
Define API endpoints and map to controllers

### Middleware (`/src/middleware`)
Handle authentication, validation, error handling, rate limiting

---

## 🔄 Data Flow Example: Search Medicines

```
1. User sends: GET /api/medicines/search?query=aspirin
   ↓
2. Route handler validates query parameter
   ↓
3. Controller executes: Medicine.find({ $text: { $search: 'aspirin' } })
   ↓
4. MongoDB returns matching documents
   ↓
5. Controller formats response with pagination
   ↓
6. Response sent to client with 200 status
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [GeometryType in MongoDB](https://docs.mongodb.com/manual/reference/geojson/)

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👥 Support

For issues or questions, please create an issue or contact the development team.

**Happy Coding! 🎉**
