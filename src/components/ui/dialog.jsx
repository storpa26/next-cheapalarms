import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const DialogContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
});

export function Dialog({ children, open, onOpenChange }) {
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
    <DialogContext.Provider value={{ isOpen: computedOpen, setIsOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild, ...props }) {
  const { setIsOpen } = React.useContext(DialogContext);
  
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

export const DialogContent = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = React.useContext(DialogContext);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
     
    setMounted(true);
    return () => {
       
      setMounted(false);
    };
  }, []);
  
  if (!isOpen || !mounted) return null;
  
  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={ref}
      className={cn(
        "bg-elevated text-foreground relative rounded-xl border border-border shadow-elevated max-w-4xl w-full",
        className
      )}
        style={{ 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-20 rounded-md p-2 opacity-70 hover:opacity-100 transition-opacity duration-normal ease-standard bg-surface border border-border"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="overflow-y-auto flex-1" style={{ maxHeight: '90vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
  
  return createPortal(content, document.body);
});

DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className = '', ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  );
}

export const DialogTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-2xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
));

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

DialogDescription.displayName = 'DialogDescription';

