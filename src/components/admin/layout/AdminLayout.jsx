import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export default function AdminLayout({ title = "Admin", children }) {
  return (
    <main className="bg-muted text-foreground min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title={title} />
          <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </div>
      </div>
    </main>
  );
}


