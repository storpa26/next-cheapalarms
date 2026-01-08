import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for debouncing function calls
 * Best practice: Prevents rapid-fire clicks and improves performance
 * 
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} Debounced function
 */
export function useDebounce(fn, delay = 300) {
  const timeoutRef = useRef(null);

  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

/**
 * Hook to prevent duplicate actions (like navigation)
 * Best practice: Tracks action state to prevent race conditions
 * Properly awaits Promises and resets state after completion
 * Prevents memory leaks by checking component mount state before updating
 * 
 * @param {Function} action - Action function to guard
 * @returns {[Function, boolean]} - [guardedAction, isPending]
 */
export function useActionGuard(action) {
  const isPendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef(null); // Track timeout for cleanup
  const isMountedRef = useRef(true); // Track mounted state to prevent memory leaks

  const guardedAction = useCallback(
    async (...args) => {
      if (isPendingRef.current) {
        return;
      }

      isPendingRef.current = true;
      setIsPending(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        const result = action(...args);
        // Handle both sync and async actions
        if (result && typeof result.then === 'function') {
          // For async actions (Promises), await completion
          await result;
          // Reset immediately after Promise resolves, but only if component is still mounted
          if (isMountedRef.current) {
            isPendingRef.current = false;
            setIsPending(false);
          }
        } else {
          // For sync actions, use a small delay to prevent rapid re-clicks
          timeoutRef.current = setTimeout(() => {
            // Only update state if component is still mounted
            if (isMountedRef.current) {
              isPendingRef.current = false;
              setIsPending(false);
            }
            timeoutRef.current = null;
          }, 100);
        }
      } catch (error) {
        // Log error but don't throw - let the action handle its own errors
        // If action needs to handle errors, it should do so before throwing
        if (process.env.NODE_ENV === 'development') {
          console.error('Action guard error:', error);
        }
        // Reset on error, but only if component is still mounted
        if (isMountedRef.current) {
          isPendingRef.current = false;
          setIsPending(false);
        }
      }
    },
    [action]
  );

  // Track mounted state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return [guardedAction, isPending];
}

