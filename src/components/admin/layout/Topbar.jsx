import { SignOutButton } from "@/components/ui/sign-out-button";

export function Topbar({ title }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Theme toggle removed - portals don't support theme switching */}
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}


