# PropertyPilot Backend API Integration Guide

**Version**: 1.0.0
**Last Updated**: December 2024
**Base URL**: `http://localhost:3001` (development)

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Properties](#property-endpoints)
   - [Scenarios](#scenario-endpoints)
   - [Renovations](#renovation-endpoints)
   - [Alerts](#alert-endpoints)
   - [Dashboard](#dashboard-endpoints)
   - [File Uploads](#file-upload-endpoints)
   - [Reports](#report-endpoints)
   - [Integrations](#integration-endpoints)
   - [User Management](#user-management-endpoints)

---

## Overview

The PropertyPilot backend provides a comprehensive REST API for real estate investment analysis. It includes property management, financial scenario analysis, file uploads, reporting, and GDPR/CCPA compliance features.

**Key Features**:
- Session-based authentication with secure httpOnly cookies
- Real estate financial calculations (NOI, Cap Rate, IRR, NPV, etc.)
- Property comparable sales (comps) data
- Background job processing for data syncing
- File upload with S3/MinIO support
- Audit logging for compliance
- Rate limiting for API protection
- Comprehensive error handling

---

## Authentication

### Session-Based Authentication

PropertyPilot uses **session-based authentication** with email/password credentials. Sessions are stored in the database and managed via secure httpOnly cookies.

#### Login Flow

1. **Register** (optional): Create a new user account
2. **Login**: Authenticate with email/password to obtain a session
3. **Authenticated Requests**: Include the session cookie automatically (managed by browser/client)
4. **Logout**: Destroy the session

#### Session Cookie Details

- **Name**: `sessionId`
- **HttpOnly**: `true` (cannot be accessed via JavaScript)
- **Secure**: `true` (HTTPS in production, auto-negotiated in dev)
- **SameSite**: `strict` (CSRF protection)
- **Max Age**: 24 hours

#### Protected Endpoints

All endpoints except `/api/auth/register` and `/api/auth/login` require an active session. If the session is invalid or expired, the API returns a **401 Unauthorized** response.

---

## Response Format

All API responses follow a consistent JSON format.

### Success Response (2xx)

```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

Or for list endpoints:

```json
{
  "success": true,
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": {
    "field": ["validation error message"]
  },
  "requestId": "req_12345"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| **200** | OK - Request succeeded |
| **201** | Created - Resource created successfully |
| **400** | Bad Request - Validation error or malformed request |
| **401** | Unauthorized - Session expired or invalid |
| **403** | Forbidden - User doesn't have permission |
| **404** | Not Found - Resource doesn't exist |
| **409** | Conflict - Resource already exists |
| **429** | Too Many Requests - Rate limit exceeded |
| **500** | Internal Server Error - Server error |

---

## Error Handling

### Validation Errors

Request body/params validation errors return **400 Bad Request**:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "path": ["password"],
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Authentication Errors

Invalid or expired sessions return **401 Unauthorized**:

```json
{
  "success": false,
  "error": "Unauthorized",
  "requestId": "req_12345"
}
```

### Rate Limiting

Rate limits are enforced per user/IP and return **429 Too Many Requests**:

```json
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 60,
  "requestId": "req_12345"
}
```

**Response Headers**:
- `X-RateLimit-Limit`: Maximum requests in the window
- `X-RateLimit-Remaining`: Requests remaining in the window
- `X-RateLimit-Reset`: ISO 8601 timestamp when the window resets

---

## Endpoints

### Auth Endpoints

#### POST `/api/auth/register`

Create a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-12-03T10:00:00Z"
    }
  }
}
```

**Validation**:
- `email`: Valid email format
- `password`: Minimum 8 characters
- `name`: Non-empty string

**Rate Limit**: 5 attempts per 15 minutes per IP

---

#### POST `/api/auth/login`

Authenticate and create a session.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Sets Cookie**: `sessionId` (httpOnly, secure)

**Rate Limit**: 5 attempts per 15 minutes per IP

---

#### POST `/api/auth/logout`

Destroy the current session.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Clears Cookie**: `sessionId`

**Authentication**: Required

---

#### GET `/api/auth/me`

Get the current authenticated user.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://s3.example.com/avatars/user_123.jpg"
    }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/auth/password`

Change the current user's password.

**Request**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Authentication**: Required

---

### Property Endpoints

#### GET `/api/properties`

List all properties for the authenticated user.

**Query Parameters**:
- `type`: Filter by type (rent, flip, airbnb)
- `status`: Filter by status (lead, analyzing, offer, under_contract, owned, sold)
- `city`: Filter by city (partial match)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

**Example**: `GET /api/properties?type=flip&status=analyzing&page=1&pageSize=20`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_123",
      "address": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02101",
      "type": "flip",
      "status": "analyzing",
      "purchasePrice": 250000,
      "currentValue": 280000,
      "arv": 350000,
      "sqft": 2500,
      "bedrooms": 3,
      "bathrooms": 2,
      "yearBuilt": 1995,
      "lotSize": 0.25,
      "latitude": 42.3601,
      "longitude": -71.0589,
      "notes": "Great potential",
      "createdAt": "2024-12-03T10:00:00Z",
      "updatedAt": "2024-12-03T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

**Authentication**: Required

---

#### GET `/api/properties/:id`

Get a specific property by ID.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "property": { /* full property object */ }
  }
}
```

**Authentication**: Required

---

#### POST `/api/properties`

Create a new property.

**Request**:
```json
{
  "address": "123 Main St",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101",
  "type": "flip",
  "status": "lead",
  "purchasePrice": 250000,
  "currentValue": 250000,
  "arv": 350000,
  "sqft": 2500,
  "bedrooms": 3,
  "bathrooms": 2,
  "yearBuilt": 1995,
  "lotSize": 0.25,
  "latitude": 42.3601,
  "longitude": -71.0589,
  "notes": "Great potential"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "property": { /* created property */ }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/properties/:id`

Update a property.

**Request** (partial fields):
```json
{
  "status": "analyzing",
  "currentValue": 280000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "property": { /* updated property */ }
  }
}
```

**Authentication**: Required

---

#### DELETE `/api/properties/:id`

Delete a property (soft delete).

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Property deleted successfully"
  }
}
```

**Authentication**: Required

---

#### GET `/api/properties/:id/comps`

Get comparable sales for a property.

**Query Parameters**:
- `limit`: Number of comps (default: 10)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "property": { /* property object */ },
    "comps": [
      {
        "id": "comp_123",
        "address": "456 Elm St",
        "salePrice": 330000,
        "pricePerSqft": 132,
        "saleDate": "2024-11-15",
        "beds": 3,
        "baths": 2,
        "sqft": 2500,
        "source": "Zillow",
        "externalId": "zillow_xyz"
      }
    ]
  }
}
```

**Authentication**: Required

---

### Scenario Endpoints

#### POST `/api/properties/:propertyId/scenarios`

Create a deal scenario for a property.

**Request**:
```json
{
  "name": "Conservative Flip",
  "purchasePrice": 250000,
  "rehabCost": 50000,
  "holdingCosts": 5000,
  "closingCosts": 7500,
  "interestRate": 6.5,
  "holdTimeMonths": 6,
  "exitStrategy": "flip",
  "salePrice": 340000,
  "sellingCosts": 20400
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "scenario": {
      "id": "scen_123",
      "propertyId": "prop_123",
      "name": "Conservative Flip",
      /* ... other fields ... */
      "createdAt": "2024-12-03T10:00:00Z"
    }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/scenarios/:id`

Update a scenario.

**Request** (partial fields):
```json
{
  "rehabCost": 55000,
  "salePrice": 345000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "scenario": { /* updated scenario */ }
  }
}
```

**Authentication**: Required

---

#### DELETE `/api/scenarios/:id`

Delete a scenario.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Scenario deleted successfully"
  }
}
```

**Authentication**: Required

---

#### POST `/api/scenarios/:id/analyze`

Analyze a scenario (calculate financial metrics).

**Request** (optional, applies calculated metrics):
```json
{}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "scenario": {
      /* ... scenario fields ... */
      "capRate": 0.0825,
      "cashOnCash": 0.12,
      "roi": 0.45,
      "monthlyNOI": 2100,
      "totalProfit": 51100,
      "irr": 0.35,
      "npv": 45000
    }
  }
}
```

**Authentication**: Required

---

### Renovation Endpoints

#### POST `/api/properties/:propertyId/renovations`

Create a renovation item.

**Request**:
```json
{
  "category": "Roofing",
  "description": "Replace roof shingles",
  "estimatedCost": 8000,
  "contractor": "Acme Roofing",
  "startDate": "2024-12-10T00:00:00Z",
  "endDate": "2024-12-15T00:00:00Z",
  "status": "pending",
  "notes": "Priority item"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "renovation": { /* created renovation */ }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/renovations/:id`

Update a renovation item.

**Request** (partial fields):
```json
{
  "status": "in_progress",
  "actualCost": 7500
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "renovation": { /* updated renovation */ }
  }
}
```

**Authentication**: Required

---

#### DELETE `/api/renovations/:id`

Delete a renovation item.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Renovation deleted successfully"
  }
}
```

**Authentication**: Required

---

### Alert Endpoints

#### GET `/api/alerts`

List alerts for the authenticated user.

**Query Parameters**:
- `read`: Filter by read status (true/false)
- `limit`: Number of alerts (default: 50)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_123",
      "type": "price_trend",
      "title": "Price Increase Detected",
      "message": "123 Main St increased by 8%",
      "propertyId": "prop_123",
      "read": false,
      "createdAt": "2024-12-03T10:00:00Z"
    }
  ]
}
```

**Authentication**: Required

---

#### PUT `/api/alerts/:id/read`

Mark an alert as read.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "alert": { /* updated alert */ }
  }
}
```

**Authentication**: Required

---

#### DELETE `/api/alerts/:id`

Delete an alert.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Alert deleted successfully"
  }
}
```

**Authentication**: Required

---

### Dashboard Endpoints

#### GET `/api/dashboard/kpi`

Get key performance indicators for the user's portfolio.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "kpi": {
      "totalProperties": 12,
      "totalInvested": 3500000,
      "totalValue": 4200000,
      "averageCapRate": 0.0825,
      "totalMonthlyNOI": 28500,
      "underContract": 2,
      "activeDeals": 3
    }
  }
}
```

**Authentication**: Required

---

#### GET `/api/dashboard/portfolio-trend`

Get historical portfolio trends.

**Query Parameters**:
- `months`: Number of months (default: 12)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "month": "2024-01",
        "totalValue": 3800000,
        "monthlyNOI": 26000,
        "propertyCount": 10
      },
      {
        "month": "2024-02",
        "totalValue": 3900000,
        "monthlyNOI": 27000,
        "propertyCount": 11
      }
    ]
  }
}
```

**Authentication**: Required

---

#### GET `/api/dashboard/deal-flow`

Get deal pipeline statistics.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "dealFlow": {
      "lead": 5,
      "analyzing": 3,
      "offer": 2,
      "under_contract": 1,
      "owned": 12,
      "sold": 2
    }
  }
}
```

**Authentication**: Required

---

### File Upload Endpoints

#### POST `/api/upload`

Upload a single file.

**Request**: Form data with `file` field

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/file.pdf" \
  -F "propertyId=prop_123" \
  -F "renovationId=reno_456"
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_123",
      "propertyId": "prop_123",
      "renovationId": null,
      "originalName": "inspection_report.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,
      "s3Key": "uploads/user_123/prop_123/inspection_report_abc123.pdf",
      "signedUrl": "https://s3.example.com/uploads/...",
      "signedUrlExpiresAt": "2024-12-10T10:00:00Z",
      "createdAt": "2024-12-03T10:00:00Z"
    }
  }
}
```

**Rate Limit**: 10 uploads per hour per user

**Authentication**: Required

---

#### POST `/api/upload/batch`

Upload multiple files.

**Request**: Form data with multiple `files` field

```bash
curl -X POST http://localhost:3001/api/upload/batch \
  -F "files=@file1.pdf" \
  -F "files=@file2.jpg" \
  -F "propertyId=prop_123"
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "files": [
      { /* file 1 */ },
      { /* file 2 */ }
    ],
    "count": 2
  }
}
```

**Authentication**: Required

---

#### GET `/api/properties/:propertyId/files`

Get files for a property.

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    { /* file 1 */ },
    { /* file 2 */ }
  ]
}
```

**Authentication**: Required

---

#### DELETE `/api/uploads/:fileId`

Delete a file.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "File deleted successfully"
  }
}
```

**Authentication**: Required

---

### Report Endpoints

#### GET `/api/reports/portfolio`

Generate a portfolio report.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "report": {
      "generatedAt": "2024-12-03T10:00:00Z",
      "user": { /* user details */ },
      "summary": {
        "totalProperties": 12,
        "totalInvested": 3500000,
        "totalValue": 4200000,
        "averageCapRate": 0.0825,
        "totalMonthlyNOI": 28500
      },
      "properties": [
        { /* property 1 with scenarios */ },
        { /* property 2 with scenarios */ }
      ]
    }
  }
}
```

**Authentication**: Required

---

#### GET `/api/reports/property/:propertyId`

Generate a property-specific report.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "report": {
      "generatedAt": "2024-12-03T10:00:00Z",
      "property": { /* property details */ },
      "scenarios": [ /* all scenarios */ ],
      "renovations": [ /* all renovations */ ],
      "comps": [ /* comparable sales */ ],
      "files": [ /* uploaded files */ ]
    }
  }
}
```

**Authentication**: Required

---

#### GET `/api/reports/portfolio/export?format=json|csv`

Export portfolio report in JSON or CSV format.

**Query Parameters**:
- `format`: Export format (json, csv) - default: json

**Response**: File download with appropriate content type

**Authentication**: Required

---

#### GET `/api/reports/property/:propertyId/export?format=json|csv`

Export property report in JSON or CSV format.

**Query Parameters**:
- `format`: Export format (json, csv) - default: json

**Response**: File download with appropriate content type

**Authentication**: Required

---

### Integration Endpoints

#### GET `/api/integrations`

List all available integrations and their status.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "intg_123",
        "service": "zillow",
        "isActive": true,
        "lastSyncAt": "2024-12-03T08:00:00Z",
        "syncStatus": "success"
      },
      {
        "id": "intg_124",
        "service": "airdna",
        "isActive": false,
        "lastSyncAt": null,
        "syncStatus": null
      }
    ]
  }
}
```

**Authentication**: Required

---

#### POST `/api/integrations/:service/connect`

Connect to an external service.

**Request**:
```json
{
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "integration": {
      "id": "intg_123",
      "service": "zillow",
      "isActive": true,
      "syncStatus": "success"
    }
  }
}
```

**Authentication**: Required

---

#### DELETE `/api/integrations/:service/disconnect`

Disconnect from an external service.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Integration disconnected successfully"
  }
}
```

**Authentication**: Required

---

### User Management Endpoints

#### GET `/api/user/me`

Get the current user's profile.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://s3.example.com/avatars/user_123.jpg",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-03T10:00:00Z"
    }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/user/me`

Update user profile.

**Request**:
```json
{
  "name": "Jane Doe",
  "avatar": "https://s3.example.com/avatars/new_avatar.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { /* updated user */ }
  }
}
```

**Authentication**: Required

---

#### GET `/api/user/preferences`

Get user preferences.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "preferences": {
      "currency": "USD",
      "timezone": "America/New_York",
      "propertyTypes": ["rent", "flip", "airbnb"],
      "propertyStatuses": ["lead", "analyzing", "offer", "under_contract", "owned"]
    }
  }
}
```

**Authentication**: Required

---

#### PUT `/api/user/preferences`

Update user preferences.

**Request**:
```json
{
  "currency": "EUR",
  "timezone": "Europe/London",
  "propertyTypes": ["rent", "flip"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "preferences": { /* updated preferences */ }
  }
}
```

**Authentication**: Required

---

#### GET `/api/user/export-data`

Export all user data (GDPR compliance).

**Response**: JSON file download containing:
- User profile
- All properties
- All scenarios
- All renovations
- All file uploads
- All alerts
- All comparable sales
- Preferences
- Integration details

**File Name**: `user-data-export.json`

**Authentication**: Required

---

#### POST `/api/user/delete-account`

Delete the user account and all associated data (GDPR compliance).

**Request**:
```json
{
  "password": "user_password"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully. All your data has been removed."
  }
}
```

**Note**: This action is irreversible. All data associated with the account will be permanently deleted, including files in S3.

**Authentication**: Required

---

## Rate Limiting

The API implements rate limiting to protect against abuse:

| Endpoint Group | Limit | Window |
|---|---|---|
| Global | 1000 requests | 15 minutes |
| Auth (login/register) | 5 attempts | 15 minutes |
| API (general) | 60 requests | 1 minute |
| Upload | 10 uploads | 1 hour |

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets (ISO 8601)

---

## Webhooks (Future)

Webhooks for real-time updates are planned for a future release. Users will be able to subscribe to events such as:
- Property status changes
- Scenario analysis completion
- Alert generation
- File upload completion
- Integration sync status

---

## Best Practices

### 1. Authentication
- Always include the session cookie in requests (automatic with browser/fetch)
- Handle **401 Unauthorized** responses by redirecting to login
- Session tokens expire after 24 hours

### 2. Error Handling
- Always check the `success` field in responses
- Use the `error` field for user-facing messages
- Use the `details` field for programmatic error handling
- Log the `requestId` for debugging support requests

### 3. Pagination
- Use `page` and `pageSize` parameters for list endpoints
- Check `hasMore` to determine if there are additional results
- Default `pageSize` is 20, maximum is 100

### 4. File Uploads
- Signed URLs expire after 7 days
- Call `/refresh-url` endpoint to get a new signed URL
- Keep file uploads under 50MB
- Use multipart form data for file uploads

### 5. Rate Limiting
- Implement exponential backoff when receiving **429** responses
- Monitor `X-RateLimit-Remaining` header to proactively avoid hitting limits
- Cache responses when possible to reduce API calls

### 6. Data Privacy
- User data is encrypted at rest and in transit
- All API communication uses HTTPS in production
- Sensitive data (passwords) is hashed with bcrypt
- Audit logs track all user actions for compliance

---

## Support

For API issues or questions:
1. Check this documentation first
2. Review the error message and `requestId`
3. Check the status page at `/health`
4. Contact support with the `requestId` for faster resolution

---

## Changelog

### Version 1.0.0 (December 2024)
- Initial release
- All core endpoints (auth, properties, scenarios, renovations, alerts, dashboard, uploads, reports, integrations, user management)
- Session-based authentication
- Rate limiting and audit logging
- GDPR/CCPA compliance features
- File upload with S3 support
- Financial calculations and reporting
