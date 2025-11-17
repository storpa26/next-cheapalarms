# ServiceM8 API Integration

**Note:** All ServiceM8 backend logic has been moved to WordPress. These Next.js routes are now **proxies** that forward requests to WordPress REST API.

## Architecture

- **Backend (WordPress):** Handles all ServiceM8 API calls, business logic, and API key management
- **Frontend (Next.js):** Proxies requests to WordPress REST API

## WordPress Endpoints

All ServiceM8 functionality is now available at:
- `http://localhost:10013/wp-json/ca/v1/servicem8/test`
- `http://localhost:10013/wp-json/ca/v1/servicem8/companies`
- `http://localhost:10013/wp-json/ca/v1/servicem8/jobs`
- `http://localhost:10013/wp-json/ca/v1/servicem8/jobs/{uuid}`

## Next.js Proxy Routes

These routes proxy to WordPress (maintains same API surface for frontend):

- **GET** `/api/servicem8/test` → Proxies to `/wp-json/ca/v1/servicem8/test`
- **GET** `/api/servicem8/companies` → Proxies to `/wp-json/ca/v1/servicem8/companies`
- **POST** `/api/servicem8/companies` → Proxies to `/wp-json/ca/v1/servicem8/companies`
- **GET** `/api/servicem8/jobs` → Proxies to `/wp-json/ca/v1/servicem8/jobs`
- **POST** `/api/servicem8/jobs` → Proxies to `/wp-json/ca/v1/servicem8/jobs`
- **GET** `/api/servicem8/jobs/[uuid]` → Proxies to `/wp-json/ca/v1/servicem8/jobs/{uuid}`
- **DELETE** `/api/servicem8/jobs/[uuid]` → Proxies to `/wp-json/ca/v1/servicem8/jobs/{uuid}`

## Configuration

Add ServiceM8 API key to WordPress:

**Option 1: wp-config.php**
```php
define('CA_SERVICEM8_API_KEY', 'your-api-key-here');
```

**Option 2: config/secrets.php** (in WordPress plugin directory)
```php
return [
    // ... other config
    'servicem8_api_key' => 'your-api-key-here',
];
```

## Testing

1. **Test WordPress endpoint directly:**
   ```
   http://localhost:10013/wp-json/ca/v1/servicem8/test
   ```

2. **Test via Next.js proxy:**
   ```
   http://localhost:8882/api/servicem8/test
   ```

Both should return the same result (WordPress handles the actual API call).
