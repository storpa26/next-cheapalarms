import { memo } from "react";

// Generate consistent color based on name
function getAvatarColor(name) {
  if (!name) return "bg-muted";
  
  const colors = [
    "bg-info",
    "bg-success",
    "bg-primary",
    "bg-secondary",
    "bg-primary/80",
    "bg-warning",
    "bg-error",
    "bg-info/80",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const Avatar = memo(function Avatar({ name, email, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const colorClass = getAvatarColor(name || email || "");
  const initials = getInitials(name || email || "");

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        rounded-full flex items-center justify-center
        text-primary-foreground font-semibold
        flex-shrink-0
      `}
      title={name || email || ""}
    >
      {initials}
    </div>
  );
});

