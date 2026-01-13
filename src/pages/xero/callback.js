import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getWpBase } from "../../lib/api/wp-proxy";

/**
 * Xero OAuth Callback Page
 * 
 * This page handles the OAuth callback from Xero after user authorization.
 * Xero redirects here with a code and state parameter.
 * 
 * Flow:
 * 1. User clicks "Connect Xero" -> redirects to Xero authorization page
 * 2. User authorizes -> Xero redirects to this page with code & state
 * 3. This page exchanges code for access token via WordPress API
 * 4. Redirects user to admin page with success/error message
 * 
 * Note: This is a page route (not API route) to ensure it's accessible
 * from external redirects without authentication middleware interference.
 */
export default function XeroCallback() {
  const router = useRouter();
  
  useEffect(() => {
    async function handleCallback() {
      // Wait for router to be ready
      if (!router.isReady) return;
      
      const { code, state, error } = router.query;
      
      // Handle OAuth errors from Xero
      if (error) {
        router.replace(`/admin/invoices?xero_error=${encodeURIComponent(error)}`);
        return;
      }
      
      // Validate required parameters
      if (!code || !state) {
        router.replace(`/admin/invoices?xero_error=${encodeURIComponent("Missing authorization code or state")}`);
        return;
      }
      
      try {
        const wpBase = getWpBase();
        if (!wpBase) {
          throw new Error("WordPress API URL not configured");
        }
        
        const response = await fetch(`${wpBase}/ca/v1/xero/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[Xero Callback] JSON parse error:", parseError);
          router.replace(`/admin/invoices?xero_error=${encodeURIComponent("Invalid response format")}`);
          return;
        }
        
        if (!response.ok || !data.ok) {
          const errorMessage = 
            data?.err || 
            data?.message || 
            data?.error?.message ||
            `HTTP ${response.status}: ${response.statusText || "Unknown error"}` ||
            "Failed to connect Xero";
          console.error("[Xero Callback] API error:", {
            status: response.status,
            statusText: response.statusText,
            data,
          });
          router.replace(`/admin/invoices?xero_error=${encodeURIComponent(errorMessage)}`);
          return;
        }
        
        // Success - redirect to admin invoices page
        router.replace(`/admin/invoices?xero_connected=true&tenant_id=${data.tenantId || ""}`);
      } catch (error) {
        console.error("[Xero Callback] Error:", error);
        const errorMessage = error.message || "Connection failed";
        router.replace(`/admin/invoices?xero_error=${encodeURIComponent(errorMessage)}`);
      }
    }
    
    handleCallback();
  }, [router.isReady, router.query, router]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>Processing Xero connection...</div>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>Please wait while we complete the authorization.</div>
    </div>
  );
}

