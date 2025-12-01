import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/ui/sign-out-button";

export function Topbar({ title }) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}


