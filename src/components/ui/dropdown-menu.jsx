import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
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
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext);

    if (asChild) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: (e) => {
          children.props?.onClick?.(e);
          setOpen(!open);
        },
      });
    }

    return (
      <button
        ref={ref}
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
    const { open } = React.useContext(DropdownMenuContext);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          "absolute", // Add absolute positioning
          align === "end" ? "right-0" : "left-0",
          className
        )}
        style={{ marginTop: `${sideOffset}px` }}
        {...props}
      />
    );
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

