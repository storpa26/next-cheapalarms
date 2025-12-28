/**
 * State management utilities for workflow simulator
 */

// Security: Recursively check for dangerous keys that could cause prototype pollution
function hasDangerousKeys(obj, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return true; // Prevent deep nesting attacks
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key in obj) {
    if (dangerousKeys.includes(key)) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (hasDangerousKeys(obj[key], depth + 1, maxDepth)) return true;
    }
  }
  return false;
}

export function createStateUpdate(updates) {
  return (prevState) => {
    // Security: Check for dangerous keys recursively before applying updates
    if (hasDangerousKeys(updates)) {
      // In development, log the error
      if (process.env.NODE_ENV === 'development') {
        console.error('Security: Dangerous keys detected in state update, rejecting update');
      }
      return prevState; // Don't apply malicious update
    }
    
    const newState = { ...prevState };
    
    // Security: Prevent prototype pollution
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    // Deep merge updates
    Object.keys(updates).forEach((key) => {
      // Skip dangerous keys that could cause prototype pollution
      if (dangerousKeys.includes(key)) {
        return;
      }
      
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
        newState[key] = { ...(newState[key] || {}), ...updates[key] };
      } else {
        newState[key] = updates[key];
      }
    });
    
    return newState;
  };
}

export function getStateDiff(before, after) {
  const diff = {};
  
  // Handle null/undefined inputs
  if (before == null && after == null) {
    return diff; // No difference
  }
  if (before == null || after == null) {
    // One is null, record the difference at root
    diff['root'] = { before, after };
    return diff;
  }
  
  // Security: Add recursion depth limit to prevent stack overflow
  function compareObjects(obj1, obj2, path = '', depth = 0, maxDepth = 20) {
    if (depth > maxDepth) {
      // Prevent stack overflow on deeply nested objects
      if (process.env.NODE_ENV === 'development') {
        console.warn(`State diff recursion depth limit reached at path: ${path}`);
      }
      return;
    }
    
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    allKeys.forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null && !Array.isArray(val1) && !Array.isArray(val2)) {
        compareObjects(val1, val2, currentPath, depth + 1, maxDepth);
      } else if (val1 !== val2) {
        if (!diff[currentPath]) {
          diff[currentPath] = { before: val1, after: val2 };
        }
      }
    });
  }
  
  compareObjects(before, after);
  return diff;
}

// Security: Safe JSON stringify with circular reference detection
function safeStringify(obj, space = 2) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, space);
  } catch (error) {
    return `[Error stringifying: ${error.message}]`;
  }
}

export function formatStateForDisplay(state) {
  return safeStringify(state, 2);
}

export function createEventLogEntry(action, actor, changes, apiCall = null) {
  return {
    timestamp: new Date().toLocaleTimeString(),
    action,
    actor, // 'customer' | 'admin' | 'system'
    changes,
    apiCall: apiCall ? {
      endpoint: apiCall.endpoint,
      method: apiCall.method,
    } : null,
  };
}


