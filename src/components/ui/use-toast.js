import { useCallback, useEffect, useMemo, useState } from "react";

const listeners = new Set();

function emit(toast) {
  listeners.forEach((listener) => listener(toast));
}

export function toast(toast) {
  emit(toast);
}

export function useToast() {
  return { toast };
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const listener = (toastProps = {}) => {
      const id =
        toastProps.id || Math.random().toString(36).slice(2) + Date.now().toString(36);
      const duration =
        typeof toastProps.duration === "number" ? toastProps.duration : 4000;
      const next = {
        id,
        title: toastProps.title ?? "",
        description: toastProps.description ?? "",
        variant: toastProps.variant ?? "default",
        duration,
      };

      setItems((prev) => [...prev, next]);
      if (duration !== Infinity) {
        window.setTimeout(() => dismiss(id), duration);
      }
    };

    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [dismiss]);

  const variants = useMemo(
    () => ({
      destructive:
        "border border-rose-400/60 bg-rose-950/40 text-rose-100 shadow-rose-500/30",
      default:
        "border border-border bg-card/95 text-card-foreground shadow shadow-black/20",
    }),
    []
  );

  return (
    <>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-lg p-4 text-sm backdrop-blur ${
              variants[item.variant] ?? variants.default
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                {item.title ? (
                  <h3 className="text-sm font-semibold leading-none">{item.title}</h3>
                ) : null}
                {item.description ? (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-muted-foreground transition hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

