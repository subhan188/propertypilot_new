/**
 * Zillow Search Component
 * Allows users to search for properties on Zillow and import them to their portfolio
 */

import { useState } from 'react';
import { Search, Download, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { useZillowSearch, type ZillowSearchFilters } from '@/hooks/useZillowSearch';

export function ZillowSearch() {
  const { listings, loading, error, apiUsage, search, importProperty } =
    useZillowSearch();
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<ZillowSearchFilters>({});
  const [importing, setImporting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search(keyword, filters);
  };

  const handleImport = async (zpid: string, propertyType: 'rent' | 'flip' | 'airbnb' = 'flip') => {
    setImporting(zpid);
    try {
      await importProperty(zpid, propertyType);
      alert('Property imported successfully!');
      setKeyword('');
    } catch (err) {
      alert(`Failed to import property: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Search Zillow Properties</h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by address, city, or ZIP code (e.g., 'Boston, MA' or '02101')"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Min Price</label>
                <input
                  type="number"
                  placeholder="$"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Price</label>
                <input
                  type="number"
                  placeholder="$"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Beds</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minBeds || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minBeds: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Baths</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minBaths || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minBaths: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Sqft</label>
                <input
                  type="number"
                  placeholder="Sqft"
                  value={filters.minSqft || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minSqft: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Sqft</label>
                <input
                  type="number"
                  placeholder="Sqft"
                  value={filters.maxSqft || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxSqft: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          )}
        </form>

        {/* API Usage Stats */}
        {apiUsage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p>
              API Quota: {Math.round(100 - apiUsage.quotaPercentage)}% used •{' '}
              {apiUsage.quotaRemaining} requests remaining
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Search Results */}
      {listings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Found {listings.length} properties
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.zpid}
                className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200"
              >
                {/* Property Image */}
                {listing.photoLinks[0] && (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={listing.photoLinks[0]}
                      alt={listing.address}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Property Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-lg">${listing.price.toLocaleString()}</h4>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin size={16} />
                      {listing.address}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {listing.city}, {listing.state} {listing.zipCode}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      {listing.beds} bed
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      {listing.baths.toFixed(1)} bath
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler size={16} />
                      {listing.sqft.toLocaleString()} sqft
                    </div>
                  </div>

                  {/* Zestimate */}
                  {listing.zestimate && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <p className="text-green-700 font-semibold">
                        Zestimate: ${listing.zestimate.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {listing.status || 'Off-Market'}
                    </span>
                  </div>

                  {/* Import Button */}
                  <button
                    onClick={() => handleImport(listing.zpid, 'flip')}
                    disabled={importing === listing.zpid}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    {importing === listing.zpid
                      ? 'Importing...'
                      : 'Add to Portfolio'}
                  </button>

                  {/* View on Zillow Link */}
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-blue-600 text-sm hover:underline"
                  >
                    View on Zillow
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && keyword && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No properties found. Try different search criteria.</p>
        </div>
      )}

      {!loading && listings.length === 0 && !keyword && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Search for properties by address, city, or ZIP code</p>
        </div>
      )}
    </div>
  );
}
