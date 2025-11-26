import Link from "next/link";
import { useRouter } from "next/router";
import { navItems } from "../nav";

export function Sidebar() {
  const router = useRouter();
  return (
    <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur md:flex">
      <div className="border-b border-border/60 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">CheapAlarms</p>
        <p className="mt-3 text-lg font-semibold text-foreground">Superadmin</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


