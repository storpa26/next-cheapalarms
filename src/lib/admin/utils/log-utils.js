/**
 * Admin logs page helpers: level display, timestamp/file size formatting, stable list keys.
 */

import { XCircle, AlertCircle, Info, Bug } from "lucide-react";

export function getLevelIcon(level) {
  if (!level || typeof level !== "string") {
    return null;
  }
  switch (level.toLowerCase()) {
    case "error":
      return <XCircle className="h-4 w-4 text-error" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case "info":
      return <Info className="h-4 w-4 text-info" />;
    case "debug":
      return <Bug className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
}

export function getLevelColor(level) {
  if (!level || typeof level !== "string") {
    return "text-foreground";
  }
  switch (level.toLowerCase()) {
    case "error":
      return "text-error";
    case "warning":
      return "text-warning";
    case "info":
      return "text-info";
    case "debug":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "No timestamp";
  }
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate stable unique key for log entries (includes index for uniqueness).
 * @param {object} log - Log entry
 * @param {number} index - Row index
 * @returns {string} Stable key
 */
export function getLogKey(log, index) {
  if (log?.request_id && log?.timestamp && log?.message && typeof log.message === "string") {
    const messagePrefix = log.message.substring(0, 50).replace(/[^a-zA-Z0-9]/g, "");
    const stableId = `${log.request_id}-${log.timestamp}-${messagePrefix}-${index}`;
    return stableId.replace(/[^a-zA-Z0-9-]/g, "-");
  }
  if (log?.timestamp && log?.message && typeof log.message === "string") {
    const messageHash = log.message.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "");
    return `${log.timestamp}-${messageHash}-${index}`;
  }
  return `${log?.timestamp ?? Date.now()}-${index}`;
}
