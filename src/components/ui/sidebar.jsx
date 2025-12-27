import * as React from "react"
import {
  Menu,
  X,
  Search,
  Star,
  Clock,
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Keyboard,
  Sun,
  Moon,
  MoreVertical,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Sidebar Context
const SidebarContext = React.createContext({
  variant: "minimal",
  activeItem: null,
  onNavChange: () => {},
  searchQuery: "",
  onSearch: () => {},
  pinnedItems: [],
  onPinItem: () => {},
  onUnpinItem: () => {},
  recentItems: [],
  addRecentItem: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

// Sidebar Provider Component
export function Sidebar({
  variant = "minimal",
  navItems = [],
  activeItem,
  title = "Admin Portal",
  subtitle,
  user = { name: "John Doe", email: "john@example.com", avatar: null, status: "online" },
  showFooter = true,
  showHeader = true,
  enableSearch = false,
  enableRecentItems = false,
  enablePinnedItems = false,
  enableNestedNav = false,
  enableNotifications = false,
  enableThemeToggle = false,
  enableCommandPalette = false,
  environment,
  version,
  mobileOpen: mobileOpenProp,
  onMobileOpenChange,
  forceMobile = false,
  inContainer = false,
  hideMobileButton = false,
  onNavChange,
  onSearch,
  onPinItem,
  onUnpinItem,
  className,
  children,
}) {
  const actualIsMobile = useIsMobile()
  const isMobile = forceMobile || actualIsMobile
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pinnedItems, setPinnedItems] = React.useState([])
  const [recentItems, setRecentItems] = React.useState([])
  const [expandedItems, setExpandedItems] = React.useState(new Set())

  const mobileOpen = mobileOpenProp !== undefined ? mobileOpenProp : internalMobileOpen
  const setMobileOpen = React.useCallback(
    (value) => {
      if (onMobileOpenChange) {
        onMobileOpenChange(value)
      } else {
        setInternalMobileOpen(value)
      }
    },
    [onMobileOpenChange]
  )

  // Load pinned items from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("sidebar-pinned-items")
    if (stored) {
      try {
        setPinnedItems(JSON.parse(stored))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  // Load recent items from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("sidebar-recent-items")
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  // Save pinned items to localStorage
  React.useEffect(() => {
    if (pinnedItems.length > 0) {
      localStorage.setItem("sidebar-pinned-items", JSON.stringify(pinnedItems))
    }
  }, [pinnedItems])

  // Save recent items to localStorage
  React.useEffect(() => {
    if (recentItems.length > 0) {
      localStorage.setItem("sidebar-recent-items", JSON.stringify(recentItems))
    }
  }, [recentItems])

  // Add to recent items when activeItem changes
  React.useEffect(() => {
    if (activeItem && enableRecentItems) {
      setRecentItems((prev) => {
        const filtered = prev.filter((item) => item.href !== activeItem)
        const newItem = navItems.find((item) => item.href === activeItem)
        if (newItem) {
          return [newItem, ...filtered].slice(0, 5) // Keep last 5
        }
        return prev
      })
    }
  }, [activeItem, enableRecentItems, navItems])

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  // Handle pin/unpin
  const handlePinItem = (href) => {
    if (pinnedItems.includes(href)) {
      setPinnedItems((prev) => prev.filter((item) => item !== href))
      onUnpinItem?.(href)
    } else {
      setPinnedItems((prev) => [...prev, href])
      onPinItem?.(href)
    }
  }

  // Filter nav items based on search
  const filteredNavItems = React.useMemo(() => {
    if (!searchQuery) return navItems
    const query = searchQuery.toLowerCase()
    return navItems.filter((item) => {
      const labelMatch = item.label?.toLowerCase().includes(query)
      const hrefMatch = item.href?.toLowerCase().includes(query)
      const submenuMatch = item.submenu?.some((sub) =>
        sub.label?.toLowerCase().includes(query) || sub.href?.toLowerCase().includes(query)
      )
      return labelMatch || hrefMatch || submenuMatch
    })
  }, [navItems, searchQuery])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K: Open search or command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (enableCommandPalette) {
          // Trigger command palette (would need to be implemented)
        } else if (enableSearch) {
          // Focus search input
          const searchInput = document.querySelector('[data-sidebar-search]')
          searchInput?.focus()
        }
      }
      // Cmd/Ctrl + B: Toggle mobile menu (mobile only)
      if ((e.metaKey || e.ctrlKey) && e.key === "b" && isMobile) {
        e.preventDefault()
        setMobileOpen(!mobileOpen)
      }
      // Escape: Close mobile menu or clear search
      if (e.key === "Escape") {
        if (mobileOpen && isMobile) {
          setMobileOpen(false)
        } else if (searchQuery) {
          setSearchQuery("")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile, mobileOpen, setMobileOpen, enableSearch, enableCommandPalette, searchQuery])

  // Close mobile menu on navigation
  const handleNavClick = (href) => {
    onNavChange?.(href)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  // Touch gesture for swipe to close (mobile)
  const [touchStart, setTouchStart] = React.useState(null)
  const [touchEnd, setTouchEnd] = React.useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    if (isLeftSwipe && mobileOpen && isMobile) {
      setMobileOpen(false)
    }
  }

  const contextValue = React.useMemo(
    () => ({
      variant,
      activeItem,
      onNavChange: handleNavClick,
      searchQuery,
      onSearch: handleSearch,
      pinnedItems,
      onPinItem: handlePinItem,
      onUnpinItem: handlePinItem,
      recentItems,
      addRecentItem: (item) => {
        setRecentItems((prev) => {
          const filtered = prev.filter((i) => i.href !== item.href)
          return [item, ...filtered].slice(0, 5)
        })
      },
      mobileOpen,
      setMobileOpen,
      expandedItems,
      setExpandedItems,
    }),
    [
      variant,
      activeItem,
      searchQuery,
      pinnedItems,
      recentItems,
      mobileOpen,
      expandedItems,
      handleNavClick,
      handleSearch,
      handlePinItem,
    ]
  )

  const baseClasses = cn(
    "flex w-64 shrink-0 flex-col overflow-hidden transition-all duration-normal ease-standard font-sans",
    inContainer && isMobile ? "h-full" : "h-screen max-h-screen"
  )

  const variantClasses = {
    minimal: "bg-surface border-r border-border shadow-sm",
    glass: "bg-surface/80 backdrop-blur-xl border-r border-border/50 shadow-elevated",
    gradient: "bg-gradient-to-b from-primary/5 via-secondary/5 to-primary/5 border-r border-primary/20 shadow-elevated",
    compact: "bg-surface border-r border-border shadow-sm",
    elevated: "bg-surface border-r border-border shadow-elevated rounded-r-2xl",
    split: "bg-surface border-r border-border shadow-sm",
  }

  // Mobile: Drawer pattern
  // Desktop: Always visible
  const sidebarClasses = cn(
    baseClasses,
    variantClasses[variant],
    // Mobile: Fixed drawer (or absolute if in container)
    isMobile && (inContainer ? "absolute" : "fixed"),
    isMobile && "left-0 top-0 z-40 transform transition-transform duration-300 ease-standard",
    isMobile && (mobileOpen ? "translate-x-0" : "-translate-x-full"),
    // Desktop: Always visible, sticky
    !isMobile && "sticky top-0 translate-x-0",
    className
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Mobile Menu Button - Only show when in container and mobile mode */}
      {isMobile && inContainer && !hideMobileButton && (
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute left-4 top-4 z-50 rounded-full bg-gradient-to-r from-primary to-secondary p-3 shadow-lg transition-all hover:shadow-xl"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-primary-foreground" />
          )}
        </button>
      )}
      {/* Mobile Menu Button - For non-container (real app) */}
      {isMobile && !inContainer && (
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed left-4 top-4 z-50 rounded-full bg-gradient-to-r from-primary to-secondary p-3 shadow-lg transition-all hover:shadow-xl lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-primary-foreground" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className={cn(
            "inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden",
            inContainer ? "absolute" : "fixed"
          )}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMobileOpen(false)
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={sidebarClasses}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
        onClick={(e) => {
          // Prevent clicks inside sidebar from bubbling to overlay
          e.stopPropagation()
        }}
      >
        {children || (
          <>
            {/* Header */}
            {showHeader && (
              <SidebarHeader
                title={title}
                subtitle={subtitle}
                enableSearch={enableSearch}
                environment={environment}
                version={version}
              />
            )}

            {/* Search */}
            {enableSearch && <SidebarSearch />}

            {/* Navigation */}
            <SidebarNav
              navItems={filteredNavItems}
              enableRecentItems={enableRecentItems}
              enablePinnedItems={enablePinnedItems}
              enableNestedNav={enableNestedNav}
            />

            {/* Footer */}
            {showFooter && (
              <SidebarFooter
                user={user}
                enableNotifications={enableNotifications}
                enableThemeToggle={enableThemeToggle}
                variant={variant}
              />
            )}
          </>
        )}
      </aside>
    </SidebarContext.Provider>
  )
}

// SidebarHeader Component
function SidebarHeader({ title, subtitle, enableSearch, environment, version }) {
  const { variant } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        "px-6 py-6 border-b",
        variant === "gradient" && "border-primary/10",
        variant === "glass" && "border-border/30",
        variant !== "gradient" && variant !== "glass" && "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-medium">CheapAlarms</p>
          <p
            className={cn(
              "mt-2 text-lg font-semibold",
              variant === "gradient" && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
              variant !== "gradient" && "text-foreground"
            )}
          >
            {title}
          </p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {environment && (
          <Badge
            variant={environment === "production" ? "default" : environment === "staging" ? "warning" : "secondary"}
            className="text-xs"
          >
            {environment}
          </Badge>
        )}
      </div>
      {version && (
        <p className="mt-2 text-xs text-muted-foreground/60">v{version}</p>
      )}
    </div>
  )
}

// SidebarSearch Component
function SidebarSearch() {
  const { searchQuery, onSearch, variant } = React.useContext(SidebarContext)
  const inputRef = React.useRef(null)

  return (
    <div className="px-3 py-3 border-b border-border">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          data-sidebar-search
          type="text"
          placeholder="Search navigation..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 pr-9 h-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// SidebarNav Component
function SidebarNav({ navItems, enableRecentItems, enablePinnedItems, enableNestedNav }) {
  const {
    activeItem,
    onNavChange,
    pinnedItems,
    onPinItem,
    recentItems,
    variant,
    expandedItems,
    setExpandedItems,
  } = React.useContext(SidebarContext)

  const pinnedNavItems = enablePinnedItems
    ? navItems.filter((item) => pinnedItems.includes(item.href))
    : []
  const recentNavItems = enableRecentItems
    ? recentItems.filter((item) => navItems.some((nav) => nav.href === item.href))
    : []

  const toggleExpanded = (href) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(href)) {
        next.delete(href)
      } else {
        next.add(href)
      }
      return next
    })
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {/* Pinned Items */}
      {enablePinnedItems && pinnedNavItems.length > 0 && (
        <div className="mb-4">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pinned</p>
          {pinnedNavItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} enableNestedNav={enableNestedNav} />
          ))}
        </div>
      )}

      {/* Recent Items */}
      {enableRecentItems && recentNavItems.length > 0 && (
        <div className="mb-4">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</p>
          {recentNavItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} enableNestedNav={enableNestedNav} />
          ))}
        </div>
      )}

      {/* Main Navigation */}
      <div>
        {(enablePinnedItems || enableRecentItems) && (
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</p>
        )}
        {navItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} enableNestedNav={enableNestedNav} />
        ))}
      </div>

      {/* No Results */}
      {navItems.length === 0 && (
        <div className="px-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">No results found</p>
        </div>
      )}
    </nav>
  )
}

// SidebarNavItem Component
function SidebarNavItem({ item, enableNestedNav }) {
  const {
    activeItem,
    onNavChange,
    pinnedItems,
    onPinItem,
    variant,
    expandedItems,
    setExpandedItems,
  } = React.useContext(SidebarContext)

  const Icon = item.icon
  const isActive = activeItem === item.href
  const hasSubmenu = enableNestedNav && item.submenu && item.submenu.length > 0
  const isExpanded = expandedItems.has(item.href)

  const itemClasses = {
    minimal: cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-fast ease-standard relative group",
      isActive
        ? "bg-primary/10 text-primary border-l-2 border-primary"
        : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground"
    ),
    glass: cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-fast ease-standard backdrop-blur-sm relative group",
      isActive
        ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
        : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
    ),
    gradient: cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-fast ease-standard relative group",
      isActive
        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
    ),
    compact: cn(
      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-fast ease-standard relative group",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground"
    ),
    elevated: cn(
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-fast ease-standard relative group",
      isActive
        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
        : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground hover:shadow-sm"
    ),
    split: cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-fast ease-standard relative group",
      isActive
        ? "bg-primary/10 text-primary border-l-4 border-primary"
        : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground"
    ),
  }

  const handleClick = () => {
    if (hasSubmenu) {
      setExpandedItems((prev) => {
        const next = new Set(prev)
        if (next.has(item.href)) {
          next.delete(item.href)
        } else {
          next.add(item.href)
        }
        return next
      })
    } else {
      onNavChange(item.href)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={itemClasses[variant]}
        onMouseDown={(e) => {
          // Ripple effect
          const button = e.currentTarget
          const ripple = document.createElement("span")
          const rect = button.getBoundingClientRect()
          const size = Math.max(rect.width, rect.height)
          const x = e.clientX - rect.left - size / 2
          const y = e.clientY - rect.top - size / 2
          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
          `
          button.style.position = "relative"
          button.style.overflow = "hidden"
          button.appendChild(ripple)
          setTimeout(() => ripple.remove(), 600)
        }}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-fast ease-standard",
            isActive && variant === "gradient" && "text-primary-foreground",
            isActive && variant !== "gradient" && "text-primary",
            isActive && "animate-pulse"
          )}
        />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <Badge variant="default" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
            {item.badge}
          </Badge>
        )}
        {hasSubmenu && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-fast ease-standard",
              isExpanded && "rotate-180"
            )}
          />
        )}
        {isActive && variant === "split" && <ChevronRight className="h-4 w-4 text-primary" />}
        {/* Pin/Unpin control (avoid nested button) */}
        {!hasSubmenu && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onPinItem(item.href)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.stopPropagation()
                onPinItem(item.href)
              }
            }}
            className={cn(
              "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-fast ease-standard",
              "p-1 rounded hover:bg-state-hover-bg cursor-pointer select-none"
            )}
            aria-label={pinnedItems.includes(item.href) ? "Unpin" : "Pin"}
          >
            <Star
              className={cn(
                "h-3 w-3",
                pinnedItems.includes(item.href) ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </span>
        )}
      </button>
      {/* Submenu */}
      {hasSubmenu && isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
          {item.submenu.map((subItem) => {
            const SubIcon = subItem.icon
            const isSubActive = activeItem === subItem.href
            return (
              <button
                key={subItem.href}
                type="button"
                onClick={() => onNavChange(subItem.href)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-fast ease-standard",
                  isSubActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-state-hover-bg hover:text-foreground"
                )}
              >
                {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                <span className="flex-1 text-left">{subItem.label}</span>
                {subItem.badge && (
                  <Badge variant="secondary" className="h-4 min-w-4 px-1 text-xs">
                    {subItem.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// SidebarFooter Component
function SidebarFooter({ user, enableNotifications, enableThemeToggle, variant }) {
  const [theme, setTheme] = React.useState("light")
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [notificationCount, setNotificationCount] = React.useState(3)
  const userMenuRef = React.useRef(null)

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    // Would integrate with theme provider here
  }

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <div
      className={cn(
        "border-t px-6 py-4",
        variant === "gradient" && "border-primary/10",
        variant === "glass" && "border-border/30",
        variant !== "gradient" && variant !== "glass" && "border-border"
      )}
    >
      {/* Notifications */}
      {enableNotifications && (
        <div className="mb-3">
          <button
            type="button"
            className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-state-hover-bg"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left text-muted-foreground">Notifications</span>
            {notificationCount > 0 && (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                {notificationCount}
              </Badge>
            )}
          </button>
        </div>
      )}

      {/* Theme Toggle */}
      {enableThemeToggle && (
        <div className="mb-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-state-hover-bg"
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="flex-1 text-left text-muted-foreground">Theme</span>
          </button>
        </div>
      )}

      {/* User Profile */}
      {variant === "split" ? (
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-3 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  {user.name.charAt(0)}
                </div>
              )}
              {user.status && (
                <div
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface",
                    user.status === "online" && "bg-success",
                    user.status === "away" && "bg-warning",
                    user.status === "offline" && "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-state-hover-bg"
          >
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  {user.name.charAt(0)}
                </div>
              )}
              {user.status && (
                <div
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface",
                    user.status === "online" && "bg-success",
                    user.status === "away" && "bg-warning",
                    user.status === "offline" && "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-fast ease-standard",
                showUserMenu && "rotate-180"
              )}
            />
          </button>
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-surface shadow-elevated p-1 z-50">
              <button
                type="button"
                onClick={() => setShowUserMenu(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-state-hover-bg"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUserMenu(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-state-hover-bg"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUserMenu(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all hover:bg-state-hover-bg text-error"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Add ripple animation to globals.css (will be added via update)
export { Sidebar }

