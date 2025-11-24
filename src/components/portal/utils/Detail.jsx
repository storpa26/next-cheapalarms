/**
 * Detail component for displaying label-value pairs
 */
export function Detail({ label, value }) {
  return (
    <p className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">
        {value ?? <em className="text-muted-foreground/70">Not available</em>}
      </span>
    </p>
  );
}

