# HasData Zillow API Integration Guide

**PropertyPilot** now includes real-time Zillow property data integration via the **HasData API**. This guide explains how to set up and use the integration for both backend and frontend.

## Quick Start

### 1. Get HasData API Key

1. Sign up at https://docs.hasdata.com
2. Create an API key for the Zillow API
3. Add to your `.env` file:

```bash
HASDATA_API_KEY=your_api_key_here
```

### 2. Backend Setup

The backend is pre-configured with all necessary endpoints. Simply add your API key and you're ready to go.

**Environment Variables** (`.env`):
```bash
HASDATA_API_KEY=sk_live_xxxxxxxxxxxxx
```

### 3. Frontend Setup

The frontend includes a search component and custom hook for easy integration.

## Backend Features

### HasData Client Service

**File**: `src/utils/hasDataClient.ts`

Provides a wrapper around the HasData Zillow API with the following features:
- Automatic quota tracking
- Error handling with retries
- Data normalization
- TypeScript type safety

**Usage Example**:
```typescript
import { getHasDataClient } from '@/utils/hasDataClient';

const client = getHasDataClient();

// Search listings
const listings = await client.searchListings('Boston, MA', {
  minPrice: 300000,
  maxPrice: 500000,
  minBeds: 3,
});

// Get property details
const details = await client.getPropertyDetails('123456789_zpid');

// Normalize data for database
const normalized = client.normalizePropertyData(details);

// Check quota
const usage = client.getUsageStats();
console.log(`Quota used: ${client.getQuotaPercentage()}%`);
```

### API Endpoints

#### 1. Search Zillow Listings

**Endpoint**: `POST /api/zillow/search`

**Request**:
```json
{
  "keyword": "Boston, MA",
  "minPrice": 300000,
  "maxPrice": 500000,
  "minBeds": 3,
  "minBaths": 2,
  "minSqft": 1500,
  "maxSqft": 3500
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "zpid": "123456789",
        "address": "123 Main St",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101",
        "price": 450000,
        "beds": 3,
        "baths": 2,
        "sqft": 2500,
        "latitude": 42.3601,
        "longitude": -71.0589,
        "propertyType": "SINGLE_FAMILY",
        "zestimate": 460000,
        "status": "forSale",
        "photoLinks": ["url1", "url2"],
        "url": "https://www.zillow.com/..."
      }
    ],
    "count": 1,
    "apiUsage": {
      "quotaRemaining": 900,
      "quotaPercentage": 10
    }
  }
}
```

#### 2. Get Property Details

**Endpoint**: `POST /api/zillow/property-details`

**Request**:
```json
{
  "zpidOrUrl": "123456789"
  // or
  "zpidOrUrl": "https://www.zillow.com/homedetails/123-Main-St-Boston-MA-02101/123456789_zpid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "property": {
      "zpid": "123456789",
      "addressLine1": "123 Main St",
      "addressCity": "Boston",
      "addressState": "MA",
      "addressZip": "02101",
      "lat": 42.3601,
      "lng": -71.0589,
      "price": 450000,
      "beds": 3,
      "baths": 2,
      "sqft": 2500,
      "lotSize": 0.25,
      "propertyType": "SINGLE_FAMILY",
      "yearBuilt": 1995,
      "zestimate": 460000,
      "rentZestimate": 2500,
      "taxAssessment": 350000,
      "taxYear": 2023,
      "status": "forSale",
      "priceHistory": [
        {"date": "2024-12-01", "price": 450000},
        {"date": "2024-11-01", "price": 445000}
      ],
      "rentalEstimateHistory": [
        {"date": "2024-12-01", "estimate": 2500}
      ],
      "photos": ["url1", "url2"],
      "url": "https://www.zillow.com/..."
    },
    "apiUsage": {
      "quotaRemaining": 899,
      "quotaPercentage": 10.1
    }
  }
}
```

#### 3. Import Property to Portfolio

**Endpoint**: `POST /api/zillow/import`

Searches Zillow, fetches details, and creates a property in your portfolio.

**Request**:
```json
{
  "zpidOrUrl": "123456789",
  "type": "flip",
  "notes": "Great flip potential with good comps"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "prop_abc123",
      "address": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zpid": "123456789",
      "price": 450000,
      "zestimate": 460000,
      "status": "lead",
      "type": "flip",
      "createdAt": "2024-12-03T10:00:00Z"
    }
  }
}
```

#### 4. Refresh Property Data

**Endpoint**: `POST /api/zillow/refresh/:propertyId`

Fetches latest Zillow data for a property already in your portfolio.

**Response**:
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "prop_abc123",
      "zpid": "123456789",
      "zestimate": 465000,
      "lastFetched": "2024-12-03T10:05:00Z"
    }
  }
}
```

#### 5. Get API Usage Stats

**Endpoint**: `GET /api/zillow/usage`

**Response**:
```json
{
  "success": true,
  "data": {
    "usage": {
      "totalRequests": 100,
      "requestsToday": 25,
      "quotaRemaining": 900,
      "quotaTotal": 1000,
      "quotaPercentage": 10,
      "quotaPercentageRemaining": 90,
      "lastRequestTime": "2024-12-03T10:05:00Z",
      "hasQuota": true
    }
  }
}
```

## Frontend Integration

### useZillowSearch Hook

**File**: `src/hooks/useZillowSearch.ts`

Custom React hook for Zillow search functionality.

**Usage**:
```typescript
import { useZillowSearch } from '@/hooks/useZillowSearch';

function MyComponent() {
  const { listings, search, loading, error, importProperty, apiUsage } =
    useZillowSearch();

  // Search for properties
  const handleSearch = async () => {
    await search('Boston, MA', {
      minPrice: 300000,
      maxPrice: 500000,
    });
  };

  // Import property to portfolio
  const handleImport = async (zpid: string) => {
    try {
      const { propertyId } = await importProperty(zpid, 'flip', 'Notes here');
      console.log(`Property imported: ${propertyId}`);
    } catch (err) {
      console.error('Import failed', err);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {apiUsage && (
        <p>Quota: {apiUsage.quotaPercentage.toFixed(1)}% used</p>
      )}

      {error && <p className="error">{error}</p>}

      {listings.map((listing) => (
        <div key={listing.zpid}>
          <h3>{listing.address}</h3>
          <p>${listing.price.toLocaleString()}</p>
          <button onClick={() => handleImport(listing.zpid)}>
            Add to Portfolio
          </button>
        </div>
      ))}
    </div>
  );
}
```

### ZillowSearch Component

**File**: `src/components/ZillowSearch.tsx`

Pre-built search UI component with filters and property cards.

**Usage**:
```typescript
import { ZillowSearch } from '@/components/ZillowSearch';

export function PropertiesPage() {
  return (
    <div>
      <h1>My Properties</h1>
      <ZillowSearch />
    </div>
  );
}
```

**Features**:
- Full-text search by address, city, ZIP
- Advanced filtering (price, beds, baths, sqft)
- Property photos
- Zestimate display
- One-click import to portfolio
- API quota display
- Error handling

## Database Schema

New fields added to the `Property` model:

```prisma
// Zillow/HasData fields
zpid          String?  @unique       // Zillow Property ID
zestimate     Float?                 // Zillow Estimate
rentZestimate Float?                 // Zillow Rental Estimate
taxAssessment Float?
taxYear       Int?
priceHistory  Json?    @default("[]") // Array of {date, price}
rentalEstimateHistory Json? @default("[]") // Array of {date, estimate}
photos        String[] @default([])
zillowUrl     String?
zillowStatus  String?  // 'forSale' | 'pending' | 'sold' | 'rental' | 'off-market'

// Investor-specific fields
rehabCostEstimate Float?
arvEstimate   Float?
favorite      Boolean  @default(false)
lastFetched   DateTime?
```

**Migration Required**:
```bash
npx prisma migrate dev --name add_zillow_fields
```

## API Rate Limiting & Quotas

HasData API includes rate limiting:

- **Free Tier**: 1,000 requests/month
- **Pro Tier**: 10,000 requests/month
- **Enterprise**: Custom quotas

Check your quota before searching:
```typescript
const client = getHasDataClient();
console.log(client.getQuotaPercentage()); // 45 (45% used)
console.log(client.hasQuotaAvailable()); // true

// API returns 429 when quota exceeded
```

**Quota Management Tips**:
1. Cache search results in frontend state
2. Batch import multiple properties at once
3. Monitor API usage via `/api/zillow/usage`
4. Refresh data only when needed
5. Set up alerts for low quota

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": { /* validation details */ },
  "requestId": "req_12345"
}
```

**Common Errors**:

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Validation failed | Check request parameters |
| 401 | Invalid API key | Add `HASDATA_API_KEY` to `.env` |
| 404 | Property not found | Verify ZPID or Zillow URL is correct |
| 409 | Property already in portfolio | Can't import duplicates |
| 429 | API quota exceeded | Wait or upgrade plan |
| 500 | Internal server error | Check backend logs |

## Example: Full Integration Flow

```typescript
// 1. Search for properties
const client = getHasDataClient();
const listings = await client.searchListings('Boston, MA', {
  minPrice: 300000,
  maxPrice: 500000,
});

// 2. User selects a property
const selected = listings[0];

// 3. Fetch full details
const details = await client.getPropertyDetails(selected.zpid);
const normalized = client.normalizePropertyData(details);

// 4. Store in database with portfolio context
const property = await prisma.property.create({
  data: {
    userId: 'user_123',
    address: normalized.addressLine1,
    city: normalized.addressCity,
    state: normalized.addressState,
    zipCode: normalized.addressZip,
    type: 'flip',
    status: 'lead',
    purchasePrice: normalized.price,
    currentValue: normalized.zestimate,
    arv: normalized.zestimate,
    sqft: normalized.sqft,
    bedrooms: normalized.beds,
    bathrooms: normalized.baths,
    yearBuilt: normalized.yearBuilt,
    lotSize: normalized.lotSize,
    latitude: normalized.lat,
    longitude: normalized.lng,
    // Zillow fields
    zpid: normalized.zpid,
    zestimate: normalized.zestimate,
    rentZestimate: normalized.rentZestimate,
    photos: normalized.photos,
    zillowUrl: normalized.url,
    zillowStatus: normalized.status,
    lastFetched: new Date(),
  },
});

// 5. Use in analysis
const scenarios = await client.getPropertyDetails(property.zpid);
// Calculate investment scenarios with real data
```

## Frontend Integration Points

### Properties Page
- Add `<ZillowSearch />` component
- Shows search UI with filters
- Import button directly adds to portfolio

### Property Detail Page
- Display `zestimate` and `rentZestimate`
- Show price history chart
- Display property photos from Zillow
- Show tax information
- Link to Zillow listing

### Portfolio Dashboard
- Display `zillowStatus` for each property
- Calculate metrics using `zestimate` (current value)
- Track `lastFetched` timestamp
- Show portfolio performance vs. Zestimate

### Deal Analysis
- Use `rentZestimate` for rental income projections
- Compare `zestimate` vs. `purchasePrice` for equity analysis
- Use price history for trend analysis

## Security Considerations

1. **API Key**: Store in `.env`, never commit to git
2. **Rate Limiting**: Enforce per-user limits on frontend
3. **Data Validation**: Always validate Zillow data before storing
4. **User Ownership**: Ensure users can only import to their own portfolio
5. **Cache**: Cache property details to reduce API calls

## Troubleshooting

### API Key Not Working
```bash
# Verify API key is in .env
cat .env | grep HASDATA_API_KEY

# Test connection
curl -X POST http://localhost:3001/api/zillow/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Boston, MA"}'
```

### "Property not found"
- Verify ZPID is correct (numeric only)
- Check if property is still listed on Zillow
- Try full Zillow URL instead of ZPID

### "Quota exceeded"
- Check your HasData plan
- Monitor usage at https://hasdata.com/dashboard
- Upgrade to higher tier if needed

### Property import fails
- Check if property already in portfolio (zpid must be unique)
- Verify all required fields are present
- Check database is running: `npx prisma db push`

## Next Steps

1. ✅ Set up HasData API key
2. ✅ Integrate `<ZillowSearch />` in Properties page
3. ✅ Add price history charts to Property detail page
4. ✅ Update dashboard with Zillow data
5. ✅ Implement refresh scheduler for stale data
6. ✅ Add favorite/bookmark functionality
7. ✅ Create alerts for price changes
8. ✅ Implement comparable sales (comps) from Zillow

## API Documentation

- **HasData API Docs**: https://docs.hasdata.com/apis/zillow/property
- **Zillow ZPID**: https://www.zillow.com/howto/api/PropertyDetailsAPIUserGuide.htm
- **PropertyPilot Backend**: See `INTEGRATION.md` for full API reference

## Support

For issues:
1. Check this guide's "Troubleshooting" section
2. Review backend logs: `docker-compose logs backend`
3. Check HasData API status: https://hasdata.com/status
4. Contact PropertyPilot support with request ID from error response
