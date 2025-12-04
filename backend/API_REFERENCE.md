# PropertyPilot API Reference - Phase 2 Complete

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints except auth require a session cookie. Set cookies via `Set-Cookie` header in login response.

---

## Auth Endpoints (5)

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "createdAt": "..."
    }
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
Set-Cookie: sessionid=...; HttpOnly; Secure; SameSite=Strict
```

### Get Current User
```
GET /auth/me

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Logout
```
POST /auth/logout

Response: 200 OK
{
  "success": true
}
```

### Change Password
```
PUT /auth/password
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}

Response: 200 OK
{
  "success": true
}
```

---

## Property Endpoints (7)

### List Properties
```
GET /properties?type=rent&status=owned&city=Austin&page=1&pageSize=20

Query Parameters:
- type: 'rent' | 'airbnb' | 'flip' (optional)
- status: 'lead' | 'analyzing' | 'offer' | 'under_contract' | 'owned' | 'sold' (optional)
- city: string (optional, case-insensitive search)
- page: number (default: 1)
- pageSize: number (default: 20)

Response: 200 OK
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "...",
        "userId": "...",
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701",
        "type": "rent",
        "status": "owned",
        "purchasePrice": 350000,
        "currentValue": 380000,
        "arv": 400000,
        "sqft": 1800,
        "bedrooms": 3,
        "bathrooms": 2,
        "yearBuilt": 2010,
        "latitude": 30.2672,
        "longitude": -97.7431,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  }
}
```

### Create Property
```
POST /properties
Content-Type: application/json

{
  "address": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zipCode": "78701",
  "type": "rent",
  "status": "analyzing",
  "purchasePrice": 350000,
  "currentValue": 380000,
  "arv": 400000,
  "sqft": 1800,
  "bedrooms": 3,
  "bathrooms": 2,
  "yearBuilt": 2010,
  "lotSize": 0.15,
  "latitude": 30.2672,
  "longitude": -97.7431,
  "notes": "Optional notes"
}

Response: 201 Created
{
  "success": true,
  "data": { ... property object ... }
}
```

### Get Property Detail
```
GET /properties/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "...",
    ... property fields ...,
    "scenarios": [ ... ],
    "renovations": [ ... ],
    "fileUploads": [ ... ],
    "comps": [ ... ]
  }
}
```

### Update Property
```
PUT /properties/:id
Content-Type: application/json

{
  "currentValue": 400000,
  "status": "offer"
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated property ... }
}
```

### Delete Property (Soft Delete)
```
DELETE /properties/:id

Response: 200 OK
{
  "success": true
}
```

### Get Map Data
```
GET /properties/map/data

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "...",
      "address": "123 Main St",
      "latitude": 30.2672,
      "longitude": -97.7431,
      "type": "rent",
      "currentValue": 380000,
      "status": "owned"
    }
  ]
}
```

---

## Scenario Endpoints (4)

### List Scenarios
```
GET /properties/:propertyId/scenarios

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "...",
      "propertyId": "...",
      "name": "Conservative Flip",
      "purchasePrice": 350000,
      "rehabCost": 50000,
      "salePrice": 450000,
      "capRate": 6.5,
      "cashOnCash": 8.2,
      "roi": 28.5,
      "monthlyNOI": 2500,
      "totalProfit": 50000
    }
  ]
}
```

### Create Scenario
```
POST /properties/:propertyId/scenarios
Content-Type: application/json

{
  "name": "Conservative Flip",
  "purchasePrice": 350000,
  "rehabCost": 50000,
  "holdingCosts": 5000,
  "closingCosts": 10000,
  "interestRate": 7.5,
  "holdTimeMonths": 6,
  "exitStrategy": "flip",
  "salePrice": 450000,
  "sellingCosts": 15000
}

Response: 201 Created
{
  "success": true,
  "data": { ... scenario object ... }
}
```

### Update Scenario
```
PUT /scenarios/:id
Content-Type: application/json

{
  "salePrice": 475000
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated scenario ... }
}
```

### Delete Scenario
```
DELETE /scenarios/:id

Response: 200 OK
{
  "success": true
}
```

---

## Renovation Endpoints (4)

### List Renovations
```
GET /properties/:propertyId/renovations?status=in_progress

Query Parameters:
- status: 'pending' | 'in_progress' | 'completed' (optional)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "...",
      "propertyId": "...",
      "category": "Bathroom",
      "description": "Remodel master bath",
      "estimatedCost": 5000,
      "actualCost": 5200,
      "contractor": "ABC Renovations",
      "startDate": "2024-01-01",
      "endDate": "2024-01-15",
      "status": "completed",
      "photos": [ ... ]
    }
  ]
}
```

### Create Renovation
```
POST /properties/:propertyId/renovations
Content-Type: application/json

{
  "category": "Kitchen",
  "description": "Full kitchen remodel",
  "estimatedCost": 25000,
  "contractor": "ABC Renovations",
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "status": "pending"
}

Response: 201 Created
{
  "success": true,
  "data": { ... renovation object ... }
}
```

### Update Renovation
```
PUT /renovations/:id
Content-Type: application/json

{
  "status": "in_progress",
  "actualCost": 26000
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated renovation ... }
}
```

### Delete Renovation
```
DELETE /renovations/:id

Response: 200 OK
{
  "success": true
}
```

### Get Renovation Stats
```
GET /properties/:propertyId/renovations/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "total": 5,
    "byStatus": {
      "pending": 1,
      "in_progress": 2,
      "completed": 2
    },
    "estimatedTotal": 100000,
    "actualTotal": 95000,
    "percentComplete": 40
  }
}
```

---

## Alert Endpoints (5)

### List Alerts
```
GET /alerts?read=false&type=warning&limit=50

Query Parameters:
- read: boolean (optional, true/false to filter)
- type: 'info' | 'warning' | 'success' | 'error' (optional)
- limit: number (default: 50)

Response: 200 OK
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "...",
        "userId": "...",
        "type": "warning",
        "title": "Property offer expires",
        "message": "Offer expires on 2024-01-15",
        "propertyId": "...",
        "read": false,
        "createdAt": "..."
      }
    ],
    "unreadCount": 3
  }
}
```

### Mark Alert as Read
```
PUT /alerts/:id/read

Response: 200 OK
{
  "success": true,
  "data": { ... updated alert ... }
}
```

### Mark All Alerts as Read
```
POST /alerts/mark-all-read

Response: 200 OK
{
  "success": true
}
```

### Delete Alert
```
DELETE /alerts/:id

Response: 200 OK
{
  "success": true
}
```

### Get Alert Stats
```
GET /alerts/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "total": 15,
    "unread": 3,
    "byType": {
      "info": 5,
      "warning": 4,
      "success": 4,
      "error": 2
    }
  }
}
```

---

## Dashboard Endpoints (5)

### Get KPIs
```
GET /dashboard/kpi

Response: 200 OK
{
  "success": true,
  "data": {
    "portfolioValue": 7500000,
    "portfolioValueChange": 8.5,
    "monthlyCashflow": 45000,
    "cashflowChange": 12.3,
    "availableEquity": 1875000,
    "equityChange": 15.2,
    "totalProperties": 20,
    "activeDeals": 3
  }
}
```

### Get Portfolio Trend
```
GET /dashboard/portfolio-trend?days=90

Query Parameters:
- days: number (default: 90)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "date": "2024-10-01",
      "value": 7200000,
      "change": 0
    },
    {
      "date": "2024-10-02",
      "value": 7210000,
      "change": 0.14
    }
  ]
}
```

### Get Deal Flow
```
GET /dashboard/deal-flow

Response: 200 OK
{
  "success": true,
  "data": {
    "leads": 2,
    "analyzing": 5,
    "offers": 3,
    "under_contract": 2,
    "owned": 8,
    "sold": 0
  }
}
```

### Get Property Types
```
GET /dashboard/property-types

Response: 200 OK
{
  "success": true,
  "data": {
    "rent": {
      "count": 8,
      "value": 3000000
    },
    "airbnb": {
      "count": 5,
      "value": 2500000
    },
    "flip": {
      "count": 7,
      "value": 2000000
    }
  }
}
```

### Get Recent Activity
```
GET /dashboard/recent-activity?limit=10

Query Parameters:
- limit: number (default: 10)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "type": "property",
      "name": "123 Main St",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "type": "scenario",
      "name": "Conservative Flip",
      "timestamp": "2024-01-15T10:20:00Z"
    },
    {
      "type": "renovation",
      "name": "Kitchen",
      "timestamp": "2024-01-15T10:10:00Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Property not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Health Check

### Health Status
```
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Summary Statistics

- **Total Endpoints**: 30+
- **Auth Endpoints**: 5
- **Property Endpoints**: 7
- **Scenario Endpoints**: 4
- **Renovation Endpoints**: 5
- **Alert Endpoints**: 5
- **Dashboard Endpoints**: 5

All endpoints require authentication except `/auth/register`, `/auth/login`, and `/health`.
