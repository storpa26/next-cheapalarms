# ServiceM8 API Integration

This directory contains API endpoints for integrating with ServiceM8.

## Setup

1. **Add API Key to Environment Variables**

   Add to your `.env` file:
   ```
   SERVICEM8_API_KEY=your_api_key_here
   ```

2. **Test the Connection**

   Visit: `http://localhost:3000/api/servicem8/test`

   Or use curl:
   ```bash
   curl http://localhost:3000/api/servicem8/test
   ```

## Available Endpoints

### Test Connection
- **GET** `/api/servicem8/test`
  - Tests API key and connection to ServiceM8

### Jobs
- **GET** `/api/servicem8/jobs`
  - List all jobs
  - Query params: `uuid`, `company_uuid`, `status`
  
- **POST** `/api/servicem8/jobs`
  - Create a new job
  - Required: `company_uuid`
  - Optional: `job_type_uuid`, `assigned_to_staff_uuid`, `scheduled_start_date`, `scheduled_end_date`, `description`, `address`

- **GET** `/api/servicem8/jobs/[uuid]`
  - Get a specific job by UUID

- **DELETE** `/api/servicem8/jobs/[uuid]`
  - Delete a job by UUID

### Companies (Clients)
- **GET** `/api/servicem8/companies`
  - List all companies
  - Query params: `uuid`, `name`
  
- **POST** `/api/servicem8/companies`
  - Create a new company
  - Required: `name`
  - Optional: `email`, `phone`, `address`, `city`, `state`, `postcode`, `country`

## Usage Example

```javascript
// Create a company
const company = await fetch('/api/servicem8/companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Company',
    email: 'test@example.com',
    phone: '0412345678',
    address: '123 Main St',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
  }),
});

// Create a job for that company
const job = await fetch('/api/servicem8/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    company_uuid: company.uuid,
    description: 'Install Ajax security system',
    scheduled_start_date: '2025-01-20T09:00:00',
  }),
});
```

## API Wrapper

The `servicem8Fetch` function in `src/lib/servicem8.js` provides a convenient wrapper for ServiceM8 API calls, similar to `ghlFetch` for GoHighLevel.

```javascript
import { servicem8Fetch } from '@/lib/servicem8';

// Use directly in server-side code
const jobs = await servicem8Fetch('/job.json');
const company = await servicem8Fetch('/company.json', {
  method: 'POST',
  body: { name: 'New Company' },
});
```

## ServiceM8 API Documentation

- Base URL: `https://api.servicem8.com/api_1.0/` (note: underscore, not slash)
- Documentation: https://developer.servicem8.com/docs/getting-started
- Authentication: **X-API-Key header** (for private applications with API key)
  - NOT `Authorization: Bearer` (that's for OAuth 2.0 public applications)

