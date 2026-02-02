"use client";

import * as React from "react";

const SidebarContext = React.createContext({
  variant: "minimal",
  activeItem: null,
  onNavChange: () => {},
  navigatingTo: null,
  searchQuery: "",
  onSearch: () => {},
  pinnedItems: [],
  onPinItem: () => {},
  onUnpinItem: () => {},
  recentItems: [],
  addRecentItem: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  expandedItems: new Set(),
  setExpandedItems: () => {},
});

export { SidebarContext };
