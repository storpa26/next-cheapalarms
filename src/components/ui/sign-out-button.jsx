"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className = "" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Show button on protected pages (admin, dashboard, portal) or if explicitly requested
  // Since these pages require auth, if user is here, they're authenticated
  const isProtectedPage = router.pathname?.startsWith("/admin") || 
                         router.pathname?.startsWith("/dashboard") || 
                         router.pathname?.startsWith("/portal");

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Clear localStorage token
      if (typeof window !== "undefined") {
        localStorage.removeItem('auth_token');
      }
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Always redirect to login after logout
      router.push("/login");
    } catch (error) {
      // Sign out error - silently fail and redirect anyway
      // Even if logout fails, redirect to login
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Show button on protected pages, or always show if className includes "always-show"
  if (!isProtectedPage && !className.includes("always-show")) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}

