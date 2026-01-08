import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  setTriggerRef: () => {},
});

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [triggerRef, setTriggerRef] = React.useState(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown-menu]')) {
        setOpen(false);
      }
    };

    // Use both mousedown and click for better compatibility
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, setTriggerRef }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen, setTriggerRef } = React.useContext(DropdownMenuContext);
    const internalRef = React.useRef(null);
    const triggerRef = ref || internalRef;

    React.useEffect(() => {
      if (triggerRef?.current) {
        setTriggerRef(triggerRef.current);
      }
    }, [triggerRef, setTriggerRef]);

    if (asChild) {
      return React.cloneElement(children, {
        ...props,
        ref: triggerRef,
        onClick: (e) => {
          children.props?.onClick?.(e);
          setOpen(!open);
        },
      });
    }

    return (
      <button
        ref={triggerRef}
        className={cn(
          "inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "end", sideOffset = 4, ...props }, ref) => {
    const { open, triggerRef } = React.useContext(DropdownMenuContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      if (!open || !triggerRef) return;

      let retryCount = 0;
      const MAX_RETRIES = 10;

      const updatePosition = () => {
        if (!triggerRef || !contentRef.current) return;

        const triggerRect = triggerRef.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        // If content hasn't rendered yet (width/height is 0), retry with limit
        if (contentRect.width === 0 || contentRect.height === 0) {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            requestAnimationFrame(updatePosition);
          } else {
            // Fallback: use trigger position if content never renders (prevents infinite loop)
            setPosition({
              top: triggerRect.bottom + sideOffset,
              left: align === "end" ? triggerRect.right : triggerRect.left,
            });
          }
          return;
        }

        // Reset retry count on success
        retryCount = 0;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = triggerRect.bottom + sideOffset;
        let left = align === "end" 
          ? triggerRect.right - contentRect.width 
          : triggerRect.left;

        // Adjust if content would overflow viewport
        if (left + contentRect.width > viewportWidth) {
          left = viewportWidth - contentRect.width - 8; // 8px padding
        }
        if (left < 8) {
          left = 8;
        }

        // If content would overflow bottom, show above trigger
        if (top + contentRect.height > viewportHeight) {
          top = triggerRect.top - contentRect.height - sideOffset;
        }
        if (top < 8) {
          top = 8;
        }

        setPosition({ top, left });
      };

      // Use requestAnimationFrame to ensure content is rendered
      requestAnimationFrame(updatePosition);

      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [open, triggerRef, align, sideOffset]);

    if (!open || !triggerRef) return null;

    const content = (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        {...props}
      />
    );

    // Use portal to render at document body level to avoid overflow clipping
    if (typeof window !== 'undefined') {
      return createPortal(content, document.body);
    }

    return content;
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, onSelect, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={(e) => {
          onSelect?.(e);
          setOpen(false);
        }}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("my-1 h-px bg-border", className)}
        {...props}
      />
    );
  }
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};

