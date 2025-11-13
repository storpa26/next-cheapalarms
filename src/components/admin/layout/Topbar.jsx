import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/ui/sign-out-button";

export function Topbar({ title }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}


