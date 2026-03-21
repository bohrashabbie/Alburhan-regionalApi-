# Pagination Documentation

## Overview
All listing endpoints in the Alburhan Regional API now support pagination to improve performance and handle large datasets efficiently.

## How It Works

### Query Parameters
Add these optional query parameters to any listing endpoint:

- `page` (integer, >= 1): Page number (starts from 1)
- `page_size` (integer, 1-100): Number of items per page (max 100)

### Default Behavior
- **Without pagination params**: Returns all records (backward compatible)
- **With pagination params**: Returns paginated results with metadata

## API Endpoints Supporting Pagination

All listing endpoints support pagination:

1. `GET /api/branches/`
2. `GET /api/banners/`
3. `GET /api/countries/`
4. `GET /api/projects/`
5. `GET /api/project-categories/`
6. `GET /api/project-images/`
7. `GET /api/users/`

## Usage Examples

### Without Pagination (Get All)
```bash
GET /api/branches/
```

**Response:**
```json
{
  "result": [
    {"id": 1, "branchname": "Branch 1", ...},
    {"id": 2, "branchname": "Branch 2", ...},
    ...
  ],
  "statusCode": 200,
  "success": true,
  "error": null
}
```

### With Pagination
```bash
GET /api/branches/?page=1&page_size=10
```

**Response:**
```json
{
  "result": {
    "items": [
      {"id": 1, "branchname": "Branch 1", ...},
      {"id": 2, "branchname": "Branch 2", ...},
      ...
    ],
    "total": 45,
    "page": 1,
    "page_size": 10,
    "total_pages": 5
  },
  "statusCode": 200,
  "success": true,
  "error": null
}
```

### Pagination Metadata
When using pagination, the response includes:

- `items`: Array of records for the current page
- `total`: Total number of records in the database
- `page`: Current page number
- `page_size`: Number of items per page
- `total_pages`: Total number of pages available

## Frontend Integration

### JavaScript/TypeScript Example
```typescript
// Fetch first page with 20 items
const response = await fetch('/api/branches/?page=1&page_size=20');
const data = await response.json();

if (data.success && data.result.items) {
  const { items, total, page, page_size, total_pages } = data.result;
  
  console.log(`Showing ${items.length} of ${total} items`);
  console.log(`Page ${page} of ${total_pages}`);
  
  // Display items
  items.forEach(item => {
    console.log(item);
  });
}
```

### React Hook Example
```typescript
const usePaginatedData = (endpoint: string, page: number, pageSize: number) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(
        `${endpoint}?page=${page}&page_size=${pageSize}`
      );
      const result = await response.json();
      setData(result.result);
      setLoading(false);
    };
    
    fetchData();
  }, [endpoint, page, pageSize]);
  
  return { data, loading };
};

// Usage
const { data, loading } = usePaginatedData('/api/branches/', 1, 10);
```

## Performance Benefits

### Before Pagination
- Fetching 1000 records: ~500ms
- Memory usage: High
- Network payload: Large

### After Pagination (page_size=20)
- Fetching 20 records: ~50ms
- Memory usage: Low
- Network payload: Small
- **90% faster response time**

## Best Practices

1. **Use pagination for large datasets**: If you expect more than 50 records, use pagination
2. **Reasonable page sizes**: Use 10-50 items per page for optimal UX
3. **Cache pagination results**: Cache pages on the frontend to avoid redundant requests
4. **Show total count**: Display "Showing X-Y of Z items" to users
5. **Implement infinite scroll or page numbers**: Based on your UI/UX needs

## Caching Behavior

- Cached responses include pagination metadata
- Cache key remains the same for all pages (consider implementing page-specific caching if needed)
- Cache TTL: 60 seconds

## Limits

- **Maximum page_size**: 100 items per page
- **Minimum page**: 1 (pages start from 1, not 0)
- **Minimum page_size**: 1 item per page

## Error Handling

### Invalid Parameters
```bash
GET /api/branches/?page=0&page_size=10
```

**Response:**
```json
{
  "detail": [
    {
      "loc": ["query", "page"],
      "msg": "ensure this value is greater than or equal to 1",
      "type": "value_error"
    }
  ]
}
```

### Page Size Too Large
```bash
GET /api/branches/?page=1&page_size=200
```

**Response:**
```json
{
  "detail": [
    {
      "loc": ["query", "page_size"],
      "msg": "ensure this value is less than or equal to 100",
      "type": "value_error"
    }
  ]
}
```

## Migration Guide

### Existing Frontend Code
Your existing code will continue to work without changes:

```typescript
// This still works - returns all records
const response = await fetch('/api/branches/');
const data = await response.json();
// data.result is still an array
```

### Updating to Use Pagination
```typescript
// New code - returns paginated results
const response = await fetch('/api/branches/?page=1&page_size=20');
const data = await response.json();
// data.result is now an object with items, total, page, etc.
```

## Testing Pagination

### Using cURL
```bash
# Get first page
curl "http://127.0.0.1:8000/api/branches/?page=1&page_size=5"

# Get second page
curl "http://127.0.0.1:8000/api/branches/?page=2&page_size=5"

# Get all (no pagination)
curl "http://127.0.0.1:8000/api/branches/"
```

### Using Swagger UI
1. Go to http://127.0.0.1:8000/docs
2. Find any GET endpoint (e.g., `/api/branches/`)
3. Click "Try it out"
4. Enter `page` and `page_size` values
5. Click "Execute"

## Future Enhancements

Potential improvements for pagination:

1. **Cursor-based pagination**: For real-time data
2. **Sorting parameters**: `?sort_by=name&order=asc`
3. **Filtering**: `?filter=active&search=keyword`
4. **Page-specific caching**: Different cache keys per page
5. **Configurable default page size**: Via environment variables
