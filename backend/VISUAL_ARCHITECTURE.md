# 🎯 MediLocate Backend - Visual Overview & Architecture

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Port 3000)                       │
│                      React / Vue / Angular App                     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Port 5000)                          │
│                    Node.js + Express.js Server                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │           REQUEST HANDLING LAYER (Routes)                   │ │
│  │  ┌─────────────┬──────────────┬────────────┬──────────────┐ │ │
│  │  │   /auth     │ /pharmacies  │ /medicines │ /inventory   │ │ │
│  │  └─────────────┴──────────────┴────────────┴──────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         MIDDLEWARE LAYER (Auth, Validation, Errors)         │ │
│  │  ┌──────────┬─────────────┬──────────────┬────────────────┐ │ │
│  │  │   JWT    │  Validation │   Errors    │  Rate Limit   │ │ │
│  │  │   Auth   │  & Input    │  Handler    │  Protection   │ │ │
│  │  └──────────┴─────────────┴──────────────┴────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         CONTROLLER LAYER (Business Logic)                   │ │
│  │  ┌──────────┬──────────────┬────────────┬──────────────────┐ │ │
│  │  │   Auth   │  Pharmacy    │ Medicine   │ Inventory        │ │ │
│  │  │Controller│  Controller  │Controller  │ Controller       │ │ │
│  │  └──────────┴──────────────┴────────────┴──────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │          MODEL LAYER (Data Schemas & Validation)            │ │
│  │  ┌────────┬───────┬──────────┬────────────┬────────────────┐ │ │
│  │  │ User   │ Admin │Pharmacy  │ Medicine   │ Inventory      │ │ │
│  │  │Schema  │Schema │Schema    │Schema      │ Schema         │ │ │
│  │  └────────┴───────┴──────────┴────────────┴────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────┐
            │    MongoDB (Port 27017)               │
            │   - Collections (5)                   │
            │   - Indexes (geospatial, text, etc.) │
            │   - Real-time stock data             │
            └────────────────────────────────────────┘
```

---

## Data Flow: Medicine Search

```
User Search Request
    │
    ▼
GET /api/medicines/search?query=aspirin
    │
    ├─► Route Handler (routes/medicines.js)
    │       │
    │       ├─► Rate Limiter Check (✓ Within limit)
    │       │
    │       ├─► Search Limiter (✓ 30 searches/min allowed)
    │       │
    │       ▼
    │   Controller (controllers/medicineController.js)
    │       │
    │       ├─► Validate input (query length ≥ 2)
    │       │
    │       ├─► Build Mongo filter with $text operator
    │       │
    │       ▼
    │   Database Query
    │       │
    │       ├─► MongoDB Text Index Search
    │       │   (searches: name, genericName, description)
    │       │
    │       ├─► Apply pagination (skip, limit)
    │       │
    │       ▼
    │   Results Processing
    │       │
    │       ├─► Count total matching documents
    │       │
    │       ├─► Calculate pagination metadata
    │       │
    │       ▼
    │   Response (200 OK)
    │   {
    │     "success": true,
    │     "data": [medicines array],
    │     "pagination": {page, limit, total, pages}
    │   }
    │
    ▼
Return JSON to Frontend
```

---

## Data Flow: Geolocation Pharmacy Search

```
User Location Request
    │
    ▼
GET /api/pharmacies/search?latitude=40.7128&longitude=-74.0060&maxDistance=5000
    │
    ├─► Route Handler
    │       │
    │       ├─► Validate coordinates (±lat/lng range)
    │       │
    │       ▼
    │   Controller (pharmacyController.js)
    │       │
    │       ├─► Build GeoJSON query:
    │       │   {
    │       │     $near: {
    │       │       $geometry: {
    │       │         type: "Point",
    │       │         coordinates: [lon, lat]
    │       │       },
    │       │       $maxDistance: 5000  // meters
    │       │     }
    │       │   }
    │       │
    │       ▼
    │   Database Query
    │       │
    │       ├─► MongoDB 2dsphere Index Lookup
    │       │   (Haversine distance calculation)
    │       │
    │       ├─► Sort by distance (nearest first)
    │       │
    │       ├─► Apply pagination
    │       │
    │       ▼
    │   Results with Distances
    │       │
    │       ├─► Calculate pagination
    │       │
    │       ▼
    │   Response
    │   [
    │     {pharmacy data, distance: meters},
    │     {pharmacy data, distance: meters},
    │     ...
    │   ]
    │
    ▼
Return sorted pharmacies to Frontend
```

---

## Authentication Flow

```
User Login Request
    │
    ▼
POST /api/auth/login {email, password}
    │
    ├─► Auth Rate Limiter (5 req/15min)
    │
    ├─► Controller (authController.js)
    │       │
    │       ├─► Find user in database by email
    │       │
    │       ├─► Compare password with hash
    │       │   (bcryptjs.compare)
    │       │
    │       ├─► If valid:
    │       │   └─► Generate JWT Token
    │       │       {
    │       │         userId: "...",
    │       │         role: "pharmacy_admin",
    │       │         iat: timestamp,
    │       │         exp: timestamp + 7 days
    │       │       }
    │       │
    │       ▼
    │   Response (200)
    │   {
    │     "success": true,
    │     "token": "eyJhbGciOiJIUzI1NiIs...",
    │     "user": {id, email, role}
    │   }
    │
    ▼
Frontend stores token (localStorage/sessionStorage)

──────────────────────────────────────────────

Subsequent Request with Token
    │
    ▼
PUT /api/pharmacies/ID {...}
    ├─ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    │
    ├─► Middleware: authenticateToken()
    │       │
    │       ├─► Extract token from header
    │       │
    │       ├─► Verify JWT signature (using JWT_SECRET)
    │       │
    │       ├─► Check expiration
    │       │
    │       ├─► Attach user data to req.user
    │       │
    │       ▼
    │
    ├─► Middleware: isPharmacyAdmin()
    │       │
    │       ├─► Check if req.user.role is pharmacy_admin
    │       │
    │       ├─► If yes: allow access
    │       │
    │       └─► If no: return 403 Forbidden
    │
    ├─► Controller processes request
    │
    ▼
Response with updated data
```

---

## Inventory Stock Status Update Flow

```
Admin Updates Inventory
    │
    ▼
PUT /api/inventory/{pharmacyId}/medicines/{inventoryId}
{quantity: 8, price: 5.99}
    │
    ├─► Authentication checks
    │
    ├─► Controller validation
    │
    ├─► Model update
    │
    ▼
Mongoose Pre-Save Hook
    │
    ├─► Check quantity value
    │
    ├─► If quantity === 0
    │   └─► status = "out_of_stock"
    │
    ├─► Else if quantity <= lowStockThreshold (default 5)
    │   └─► status = "low_stock"
    │
    ├─► Else
    │   └─► status = "in_stock"
    │
    ├─► Update lastRestocked timestamp
    │
    ▼
Save to MongoDB
    │
    ▼
Response to Admin
{
  "status": "low_stock",
  "quantity": 8,
  "lastRestocked": "2024-01-28T10:30:00Z"
}

────────────────────────────────────

User Searches for Medicine Availability
    │
    ▼
GET /api/inventory/search/availability?medicineId=X
    │
    ├─► Query for all pharmacies
    │
    ├─► Query inventory where:
    │   - medicine = X
    │   - status != "out_of_stock"
    │   - pharmacy.isActive = true
    │
    ▼
Results ordered by:
1. Status (in_stock first)
2. Distance (if location provided)
3. Price (lowest first - optional)
    │
    ▼
Response: List of pharmacies with this medicine available
```

---

## Database Relationship Diagram

```
┌─────────────────┐
│      User       │  (Regular customers)
│  (Collection)   │
├─────────────────┤
│ _id             │
│ username        │
│ email (unique)  │
│ password        │
│ fullName        │
│ phone           │
│ timestamps      │
└─────────────────┘


┌──────────────────┐
│      Admin       │  (Pharmacy managers)
│  (Collection)    │
├──────────────────┤
│ _id              │
│ username         │
│ email (unique)   │
│ password         │
│ role             │
│ pharmacy ────────┼────────┐
│ timestamps       │        │
└──────────────────┘        │
                            │ (1:Many)
                            │
                    ┌───────▼──────────┐
                    │    Pharmacy      │
                    │  (Collection)    │
                    ├──────────────────┤
                    │ _id              │
                    │ name             │
                    │ address          │
                    │ location (2D)    │
                    │ contact          │
                    │ owner ──────────►(Admin)
                    │ operatingHours   │
                    │ rating           │
                    │ timestamps       │
                    │                  │
                    └────────┬─────────┘
                             │ (1:Many)
                             │
                    ┌────────▼──────────┐
                    │   Inventory       │
                    │  (Collection)     │
                    ├──────────────────┤
                    │ _id              │
                    │ pharmacy ────────►(Pharmacy)
                    │ medicine ────────►(Medicine)
                    │ quantity         │
                    │ price            │
                    │ status           │
                    │ expiryDate       │
                    │ timestamps       │
                    └──────────────────┘
                             ▲
                             │ (Many:Many via Inventory)
                             │
                    ┌────────┴──────────┐
                    │    Medicine       │
                    │  (Collection)     │
                    ├──────────────────┤
                    │ _id              │
                    │ name (unique)    │
                    │ genericName      │
                    │ category         │
                    │ description      │
                    │ manufacturer     │
                    │ strength         │
                    │ unit             │
                    │ requiresPrescription
                    │ timestamps       │
                    └──────────────────┘
```

---

## API Endpoint Tree

```
/api
├── /auth
│   ├── POST /register          (User signup)
│   ├── POST /login             (User login)
│   ├── POST /admin/register    (Admin signup)
│   └── POST /admin/login       (Admin login)
│
├── /pharmacies
│   ├── GET /                   (List all)
│   ├── GET /:id                (Get details)
│   ├── GET /search             (Search by location)
│   ├── POST /                  (Create - auth required)
│   ├── PUT /:id                (Update - auth + owner)
│   └── DELETE /:id             (Delete - auth + owner)
│
├── /medicines
│   ├── GET /                   (List all)
│   ├── GET /:id                (Get details)
│   ├── GET /search             (Text search - rate limited)
│   ├── POST /                  (Add - system admin only)
│   ├── PUT /:id                (Update - system admin only)
│   └── DELETE /:id             (Delete - system admin only)
│
├── /inventory
│   ├── POST /:pharmacyId/medicines           (Add stock - auth)
│   ├── GET /:pharmacyId                      (View inventory - auth)
│   ├── GET /search/availability              (Search across all - public)
│   ├── PUT /:pharmacyId/medicines/:invId     (Update - auth)
│   └── DELETE /:pharmacyId/medicines/:invId  (Remove - auth)
│
└── /health                     (Health check - public)
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────┐
│           TECHNOLOGY STACK                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  RUNTIME: Node.js 18+                          │
│                                                 │
│  FRAMEWORK: Express.js 5.1.0                   │
│  ├─ RESTful API routing                       │
│  ├─ Middleware support                        │
│  ├─ Error handling                            │
│  └─ CORS & security                           │
│                                                 │
│  DATABASE: MongoDB 4.4+                        │
│  ├─ Collections (5): User, Admin, Pharmacy,   │
│  │   Medicine, Inventory                      │
│  ├─ Indexing: Text, Geospatial (2dsphere)    │
│  ├─ Aggregation Pipeline support              │
│  └─ Transactions                              │
│                                                 │
│  ODM: Mongoose 8.18.1                          │
│  ├─ Schema validation                         │
│  ├─ Middleware (pre/post hooks)               │
│  ├─ Population (joins)                        │
│  └─ Error handling                            │
│                                                 │
│  AUTHENTICATION: JWT + bcryptjs                │
│  ├─ JSON Web Tokens (7-day expiry)            │
│  ├─ Password hashing (10 salt rounds)         │
│  ├─ Role-based access control                 │
│  └─ Bearer token validation                   │
│                                                 │
│  SECURITY: express-rate-limit                  │
│  ├─ General: 100 req/15min                    │
│  ├─ Auth: 5 req/15min                         │
│  ├─ Search: 30 req/min                        │
│  └─ IP-based tracking                         │
│                                                 │
│  VALIDATION: Joi (optional)                    │
│  ├─ Request schema validation                 │
│  ├─ Error aggregation                         │
│  └─ Custom error messages                     │
│                                                 │
│  UTILITIES:                                    │
│  ├─ dotenv - Environment variables            │
│  ├─ cors - Cross-origin support               │
│  └─ nodemon - Dev auto-reload                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│          DOCKER COMPOSE DEPLOYMENT                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Frontend Container                               │ │
│  │ ├─ Image: node:18-alpine                        │ │
│  │ ├─ Port: 3000:80                                │ │
│  │ ├─ Volume: source code                          │ │
│  │ └─ Network: medilocate-net                      │ │
│  └──────────────────────────────────────────────────┘ │
│                      ↓ HTTP                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Backend Container                                │ │
│  │ ├─ Image: node:18-alpine                        │ │
│  │ ├─ Port: 5000:5000                              │ │
│  │ ├─ Volume: source code                          │ │
│  │ ├─ Network: medilocate-net                      │ │
│  │ └─ Env vars: MONGODB_URI, JWT_SECRET, etc       │ │
│  └──────────────────────────────────────────────────┘ │
│                      ↓ TCP                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │ MongoDB Container                                │ │
│  │ ├─ Image: mongo:6                               │ │
│  │ ├─ Port: 27017:27017                            │ │
│  │ ├─ Volume: mongo-data (persistent)              │ │
│  │ ├─ Network: medilocate-net                      │ │
│  │ └─ Database: medilocate                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘

Network: medilocate-net (bridge)
├─ Allows container-to-container communication
├─ DNS resolution by service name
└─ No port exposure needed internally
```

---

## Performance & Scalability

```
OPTIMIZATION STRATEGIES
├── Database Indexing
│   ├─ Text indexes (medicines search)
│   ├─ Geospatial index (2dsphere)
│   ├─ Compound indexes (unique constraints)
│   └─ Active status indexes
│
├── Query Optimization
│   ├─ Pagination (default 20 items)
│   ├─ Field projection (select only needed)
│   ├─ Population (efficient joins)
│   └─ Lean queries (read-only)
│
├── Rate Limiting
│   ├─ General: 100/15min
│   ├─ Auth: 5/15min (brute force protection)
│   └─ Search: 30/min
│
├── Caching (Future)
│   ├─ Redis for frequently accessed data
│   ├─ Cache medicine search results
│   └─ Cache pharmacy data
│
└── Scalability
    ├─ Stateless API (can run multiple instances)
    ├─ Connection pooling (MongoDB)
    ├─ Load balancing ready
    └─ Horizontal scaling support
```

---

## Security Layers

```
┌────────────────────────────────────────────────────┐
│         SECURITY IMPLEMENTATION                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Layer 1: Request Validation                      │
│  ├─ CORS whitelist                               │
│  ├─ Content-Type validation                      │
│  ├─ Size limits (10MB)                           │
│  └─ Rate limiting                                │
│                                                    │
│  Layer 2: Input Validation                        │
│  ├─ Mongoose schema validation                   │
│  ├─ Email format (RFC 5322)                      │
│  ├─ Phone format (E.164)                         │
│  ├─ Coordinate bounds (-180 to 180 lat/lng)     │
│  └─ Data type validation                         │
│                                                    │
│  Layer 3: Authentication                          │
│  ├─ JWT token verification                       │
│  ├─ Token expiration check                       │
│  ├─ Bearer token extraction                      │
│  └─ No token → 401 Unauthorized                  │
│                                                    │
│  Layer 4: Authorization                           │
│  ├─ Role-based access control                    │
│  ├─ Owner-based access check                     │
│  ├─ Insufficient permissions → 403 Forbidden     │
│  └─ Multi-level approval                         │
│                                                    │
│  Layer 5: Data Protection                         │
│  ├─ Passwords hashed (bcryptjs, 10 rounds)      │
│  ├─ Sensitive fields excluded from queries       │
│  ├─ No sensitive data in errors                  │
│  └─ No stack traces in production                │
│                                                    │
│  Layer 6: Database Security                       │
│  ├─ Mongoose prevents injection attacks          │
│  ├─ Parameterized queries                        │
│  ├─ Field validation                             │
│  └─ No raw queries                               │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## File Structure

```
backend/
│
├── app.js                          # Express app setup
├── package.json                    # Dependencies
├── .env                           # Environment variables
├── Dockerfile                     # Docker image definition
│
├── src/
│   │
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Admin.js               # Admin schema
│   │   ├── Pharmacy.js            # Pharmacy schema
│   │   ├── Medicine.js            # Medicine schema
│   │   └── Inventory.js           # Inventory schema
│   │
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── pharmacyController.js  # Pharmacy logic
│   │   ├── medicineController.js  # Medicine logic
│   │   └── inventoryController.js # Inventory logic
│   │
│   ├── routes/
│   │   ├── auth.js                # Auth endpoints
│   │   ├── pharmacies.js          # Pharmacy endpoints
│   │   ├── medicines.js           # Medicine endpoints
│   │   └── inventory.js           # Inventory endpoints
│   │
│   └── middleware/
│       ├── auth.js                # JWT & roles
│       ├── errorHandler.js        # Error handling
│       ├── rateLimiter.js         # Rate limiting
│       └── validation.js          # Input validation
│
└── Documentation/
    ├── README.md                  # Setup guide
    ├── API_DOCUMENTATION.md       # API reference
    ├── DESIGN_DOCUMENT.md         # Architecture
    ├── QUICK_REFERENCE.md         # Quick guide
    └── IMPLEMENTATION_SUMMARY.md  # This summary
```

---

**System Status**: ✅ Production Ready
**Last Updated**: January 28, 2026
