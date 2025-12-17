import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AlertDialogContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
});

export function AlertDialog({ children, open, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const computedOpen = isControlled ? !!open : internalOpen;

  const handleOpenChange = React.useCallback((newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  }, [isControlled, onOpenChange]);

  React.useEffect(() => {
    if (computedOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [computedOpen]);

  return (
    <AlertDialogContext.Provider value={{ isOpen: computedOpen, setIsOpen: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children, asChild, ...props }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  const handleClick = () => {
    setIsOpen(true);
  };
  
  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick, ...props });
  }
  
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export const AlertDialogContent = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = React.useContext(AlertDialogContext);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!isOpen || !mounted) return null;
  
  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={ref}
        className={cn(
          "bg-elevated text-foreground relative rounded-xl border border-border shadow-elevated max-w-lg w-full p-6",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
  
  return createPortal(content, document.body);
});

AlertDialogContent.displayName = 'AlertDialogContent';

export function AlertDialogHeader({ className = '', ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)}
      {...props}
    />
  );
}

export const AlertDialogTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));

AlertDialogTitle.displayName = 'AlertDialogTitle';

export const AlertDialogDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

AlertDialogDescription.displayName = 'AlertDialogDescription';

export function AlertDialogFooter({ className = '', ...props }) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className = '', children, onClick, ...props }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  const handleClick = (e) => {
    setIsOpen(false);
    if (onClick) onClick(e);
  };
  
  return (
    <Button onClick={handleClick} className={className} {...props}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ className = '', children, onClick, ...props }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  const handleClick = (e) => {
    setIsOpen(false);
    if (onClick) onClick(e);
  };
  
  return (
    <Button variant="outline" onClick={handleClick} className={cn("mt-2 sm:mt-0", className)} {...props}>
      {children}
    </Button>
  );
}


