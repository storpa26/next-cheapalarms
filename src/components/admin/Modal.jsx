import { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, title, children, showBackButton = true }) {
  const [mounted, setMounted] = useState(false);

  // Track client-side mount to prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (!mounted) return;
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Handle ESC key
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose, mounted]);

  // Don't render anything on server-side or if not mounted
  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex flex-col bg-background rounded-xl shadow-2xl overflow-hidden w-full max-w-7xl"
        style={{
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onClose}
                className="rounded-md p-2 hover:bg-muted/40 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
            )}
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted/40 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

