import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Package,
  FileText,
  Receipt,
  Mail,
  Users,
  Settings,
  Plug,
  ScrollText,
} from "lucide-react";
import { Sidebar as UISidebar } from "@/components/ui/sidebar";
import { navItems } from "../nav";

// Map icons to navigation items
const iconMap = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/estimates": FileText,
  "/admin/invoices": Receipt,
  "/admin/invites": Mail,
  "/admin/customers": Users,
  "/admin/settings": Settings,
  "/admin/integrations": Plug,
  "/admin/logs": ScrollText,
};

export function Sidebar() {
  const router = useRouter();
  const activeItem = router.pathname;

  // Map nav items with icons
  const adminNavItems = navItems.map((item) => ({
    ...item,
    icon: iconMap[item.href] || LayoutDashboard,
  }));

  const handleNavChange = (href) => {
    router.push(href);
  };

  return (
    <UISidebar
      variant="split"
      navItems={adminNavItems}
      activeItem={activeItem}
      title="Admin Portal"
      subtitle="Superadmin"
      showFooter={true}
      showHeader={true}
      enableSearch={false}
      enableRecentItems={false}
      enablePinnedItems={false}
      enableNestedNav={false}
      onNavChange={handleNavChange}
      inContainer={false}
    />
  );
}


