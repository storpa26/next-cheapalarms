import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="text-center space-y-4 px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          CheapAlarms Headless
        </p>
        <h1 className="text-3xl font-bold">Next.js client shell is ready.</h1>
        <p className="text-muted-foreground">
          Toggle light/dark mode and start wiring WordPress APIs + shadcn/ui.
        </p>
      </div>
    </main>
  );
}

