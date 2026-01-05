import { useEffect } from "react";

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callbacks
 * @param {boolean} enabled - Whether shortcuts are enabled
 * @param {Array} deps - Dependencies array for the effect
 * 
 * @example
 * useKeyboardShortcuts({
 *   'Meta+A': (e) => { e.preventDefault(); handleSelectAll(); },
 *   'Delete': (e) => { e.preventDefault(); handleDelete(); },
 *   'Escape': (e) => { e.preventDefault(); handleClear(); },
 * }, true, [handleSelectAll, handleDelete, handleClear]);
 */
export function useKeyboardShortcuts(shortcuts, enabled = true, deps = []) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Build key string (e.g., "Meta+A", "Delete", "Escape")
      const keyParts = [];
      if (event.metaKey || event.ctrlKey) {
        keyParts.push(event.metaKey ? "Meta" : "Ctrl");
      }
      if (event.shiftKey) {
        keyParts.push("Shift");
      }
      if (event.altKey) {
        keyParts.push("Alt");
      }
      keyParts.push(event.key);

      const keyString = keyParts.join("+");

      // Check for exact match first
      if (shortcuts[keyString]) {
        shortcuts[keyString](event);
        return;
      }

      // Check for modifier + key (e.g., "Meta+A" matches "Meta+A" or "Ctrl+A")
      if (keyParts.length > 1) {
        const modifier = keyParts[0];
        const key = keyParts[keyParts.length - 1];
        const altKeyString = `${modifier === "Meta" ? "Ctrl" : "Meta"}+${key}`;
        if (shortcuts[altKeyString]) {
          shortcuts[altKeyString](event);
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, ...deps]);
}

