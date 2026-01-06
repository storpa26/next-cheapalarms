import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs and other scenarios where you want to delay updates
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {*} The debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

