import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-elevated",
          description: "group-[.toast]:text-foreground group-[.toast]:opacity-90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Success toast - green
          success: "group-[.toaster]:bg-success-bg group-[.toaster]:border-success/50 group-[.toaster]:text-foreground [&>svg]:text-success",
          // Error toast - red
          error: "group-[.toaster]:bg-error-bg group-[.toaster]:border-error/50 group-[.toaster]:text-foreground [&>svg]:text-error",
          // Warning toast - yellow/orange
          warning: "group-[.toaster]:bg-warning-bg group-[.toaster]:border-warning/50 group-[.toaster]:text-foreground [&>svg]:text-warning",
          // Info toast - teal
          info: "group-[.toaster]:bg-info-bg group-[.toaster]:border-info/50 group-[.toaster]:text-foreground [&>svg]:text-info",
          // Loading toast - teal (same as info)
          loading: "group-[.toaster]:bg-info-bg group-[.toaster]:border-info/50 group-[.toaster]:text-foreground [&>svg]:text-info",
        },
      }}
      {...props} />
  );
}
export { Toaster }

