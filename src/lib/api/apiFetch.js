/**
 * Client-side API fetch wrapper
 * 
 * Rules:
 * - All client-side requests MUST go through Next.js API routes (/api/*)
 * - Never call WordPress directly from browser code
 * - Always include credentials for cookie-based auth
 * 
 * @param {string} path - API path (e.g., "/api/portal/dashboard" or "/api/estimate?estimateId=123")
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (default: "GET")
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {Object} options.params - Query parameters (alternative to including in path)
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - Error with message and status code
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    ...fetchOptions
  } = options;

  // Build URL with query params
  let url = path;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url = `${path}${path.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  // Prepare headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Prepare body
  let requestBody = undefined;
  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include', // Always include cookies
      headers: requestHeaders,
      body: requestBody,
      ...fetchOptions,
    });

    // Parse JSON response
    let json;
    try {
      json = await response.json();
    } catch (parseError) {
      // If response is not JSON, throw with status
      const text = await response.text().catch(() => 'Failed to read response');
      const error = new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      error.status = response.status;
      throw error;
    }

    // Check if response indicates error
    if (!response.ok) {
      const error = new Error(json.err || json.error || json.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.response = json;
      throw error;
    }

    return json;
  } catch (error) {
    // Re-throw if already our custom error
    if (error.status) {
      throw error;
    }

    // Network errors or other fetch failures
    const wrappedError = new Error(error.message || 'Network request failed');
    wrappedError.originalError = error;
    throw wrappedError;
  }
}
