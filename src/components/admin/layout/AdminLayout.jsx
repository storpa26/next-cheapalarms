import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export default function AdminLayout({ title = "Admin", children }) {
  return (
    <main className="bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar title={title} />
          <div className="px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </div>
      </div>
    </main>
  );
}


