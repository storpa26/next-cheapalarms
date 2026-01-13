import { useRouter } from "next/router";
import { useCallback, useRef, useEffect, useState } from "react";
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
import { Sidebar as UISidebar } from "../../ui/sidebar";
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

export function Sidebar({ navigatingTo, setNavigatingTo }) {
  const router = useRouter();
  const activeItem = router.pathname;
  const navigationRef = useRef(null);

  // Fallback: If navigatingTo prop not provided, use local state (for backwards compatibility)
  const [localNavigatingTo, setLocalNavigatingTo] = useState(null);
  const effectiveNavigatingTo = navigatingTo !== undefined ? navigatingTo : localNavigatingTo;

  // Map nav items with icons
  const adminNavItems = navItems.map((item) => ({
    ...item,
    icon: iconMap[item.href] || LayoutDashboard,
  }));

  /**
   * Handles navigation - IMMEDIATE execution, no delays
   * CRITICAL: Sets navigatingTo BEFORE router.push to trigger immediate UI updates
   * This updates both Sidebar active state AND AdminLayout header immediately
   */
  const handleNavChange = useCallback((href) => {
    // Prevent duplicate navigation
    if (navigationRef.current === href) {
      return;
    }

    // Don't navigate if already on this page
    if (router.pathname === href) {
      return;
    }

    // CRITICAL: Set navigatingTo IMMEDIATELY (synchronously) before router.push
    // This triggers immediate UI updates:
    // 1. Sidebar: New button becomes active, old button loses active (because navigatingTo changes)
    // 2. AdminLayout header: Title and icon update immediately via headerMetadata useMemo
    const updateNavigatingTo = setNavigatingTo || setLocalNavigatingTo;
    updateNavigatingTo(href);
    navigationRef.current = href;

    // Navigate IMMEDIATELY - no setTimeout, no delays
    router.push(href).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Navigation error:', error);
      }
      navigationRef.current = null;
      updateNavigatingTo(null);
    });
  }, [router, setNavigatingTo, setLocalNavigatingTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      navigationRef.current = null;
    };
  }, []);

  return (
    <UISidebar
      variant="split"
      navItems={adminNavItems}
      activeItem={activeItem}
      navigatingTo={effectiveNavigatingTo}
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


