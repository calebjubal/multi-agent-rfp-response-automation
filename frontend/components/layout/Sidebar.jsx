"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Settings,
  Database,
  History,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  DollarSign,
  Globe,
  Sparkles,
  Lock,
  MessageSquare,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    requiresAuth: true,
  },
  {
    title: "RFP Management",
    href: "/rfps",
    icon: FileText,
    requiresAuth: true,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: Bot,
    requiresAuth: true,
    children: [
      { title: "Sales Agent", href: "/agents/sales", icon: Globe },
      { title: "Technical Agent", href: "/agents/technical", icon: Database },
      { title: "Pricing Agent", href: "/agents/pricing", icon: DollarSign },
    ],
  },
  {
    title: "Products",
    href: "/products",
    icon: ShoppingCart,
    requiresAuth: true,
    badge: "Manage",
  },
  {
    title: "Chat Assistant",
    href: "/chat-window",
    icon: MessageSquare,
    requiresAuth: true,
    openInNewWindow: true,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
    requiresAuth: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    requiresAuth: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(["Agents"]);

  const toggleExpanded = (title) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const canAccessItem = (item) => {
    if (!item.requiresAuth) return true;
    return isAuthenticated;
  };

  const handleNavClick = (item) => {
    if (!item.openInNewWindow) return;
    if (!canAccessItem(item)) {
      return;
    }
    window.open(item.href, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-sidebar-foreground">RFP Agent</span>
              <p className="text-[10px] text-muted-foreground">AI Automation</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 mx-auto mt-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const canAccess = canAccessItem(item);
            
            return (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                        isActive(item.href)
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              expandedItems.includes(item.title) && "rotate-90"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && expandedItems.includes(item.title) && (
                      <ul className="mt-1 ml-3 space-y-0.5 border-l border-sidebar-border pl-3">
                        {item.children.map((child) => (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                isActive(child.href)
                                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                              )}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  item.openInNewWindow ? (
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                        isActive(item.href)
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                        !canAccess && "opacity-60"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">{item.title}</span>
                          {!canAccess && (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          {item.badge && canAccess && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={canAccess ? item.href : "/login"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                        isActive(item.href)
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                        !canAccess && "opacity-60"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">{item.title}</span>
                          {!canAccess && (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          {item.badge && canAccess && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === "admin" ? "Administrator" : "Member"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Guest Mode</p>
              <Link
                href="/login"
                className="text-xs text-primary hover:underline font-medium"
              >
                Sign in for full access
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
