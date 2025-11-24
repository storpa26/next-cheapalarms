import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { getWordPressUsers, getGHLContacts, matchContactsToUsers, getStatusBadge } from "@/lib/admin/services/customers-data";
import { toast } from "@/components/ui/use-toast";
import { isAuthError, isPermissionError } from "@/lib/admin/utils/error-handler";

export default function AdminCustomers({ initialWpUsers, initialGhlContacts, error, debugInfo }) {
  const [activeTab, setActiveTab] = useState("ghl"); // 'wp' | 'ghl'
  const [q, setQ] = useState("");
  const [wpUsers, setWpUsers] = useState(initialWpUsers || []);
  const [ghlContacts, setGhlContacts] = useState(initialGhlContacts || []);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Match contacts to users
  const matchedContacts = matchContactsToUsers(ghlContacts, wpUsers);

  // Filter based on search
  const filteredWpUsers = wpUsers.filter((user) => {
    if (!q?.trim()) return true;
    const s = q.toLowerCase();
    return (
      user.name?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s) ||
      user.firstName?.toLowerCase().includes(s) ||
      user.lastName?.toLowerCase().includes(s)
    );
  });

  const filteredGhlContacts = matchedContacts.filter((contact) => {
    if (!q?.trim()) return true;
    const s = q.toLowerCase();
    return (
      (contact.firstName || "").toLowerCase().includes(s) ||
      (contact.lastName || "").toLowerCase().includes(s) ||
      (contact.email || "").toLowerCase().includes(s) ||
      (contact.phone || "").includes(s)
    );
  });

  async function handleRefresh() {
    setLoading(true);
    try {
      const [users, contacts] = await Promise.all([getWordPressUsers(), getGHLContacts()]);
      setWpUsers(users);
      setGhlContacts(contacts);
      toast({
        title: "Refreshed",
        description: "Customer data has been refreshed.",
      });
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: err.message || "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteGhlContact(ghlContactId) {
    setInviting((prev) => ({ ...prev, [ghlContactId]: true }));
    try {
      const response = await fetch("/api/customers/invite-ghl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ghlContactId }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      toast({
        title: "Invite sent",
        description: "Portal invite has been sent to the contact.",
      });

      // Refresh data
      await handleRefresh();
    } catch (err) {
      toast({
        title: "Invite failed",
        description: err.message || "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setInviting((prev) => ({ ...prev, [ghlContactId]: false }));
    }
  }

  return (
    <>
      <Head>
        <title>Superadmin • Customers</title>
      </Head>
      <AdminLayout title="Customers">
        {error && (
          <Card className="mb-4 border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <CardHeader>
              <CardTitle>Error loading customers</CardTitle>
              <CardDescription>{error}</CardDescription>
              {debugInfo && (
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              )}
            </CardHeader>
          </Card>
        )}
        {fetchError && (
          <Card className="mb-4 border border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <CardHeader>
              <CardTitle>Warning</CardTitle>
              <CardDescription>{fetchError}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Portal access and GHL contacts.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search name, email…"
                className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab("ghl")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "ghl"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                GHL Contacts ({filteredGhlContacts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wp")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "wp"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                WordPress Users ({filteredWpUsers.length})
              </button>
            </div>

            {/* GHL Contacts Tab */}
            {activeTab === "ghl" && (
              <div className="overflow-x-auto rounded-md border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGhlContacts.map((contact) => {
                      const badge = getStatusBadge(contact.status);
                      const name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "No name";
                      const canInvite = contact.status === "no_account" || contact.status === "needs_invite";

                      return (
                        <tr key={contact.id} className="border-t border-border/60">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2">{contact.email || "—"}</td>
                          <td className="px-3 py-2">{contact.phone || "—"}</td>
                          <td className="px-3 py-2">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </td>
                          <td className="px-3 py-2">
                            {canInvite ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleInviteGhlContact(contact.id)}
                                disabled={inviting[contact.id]}
                              >
                                {inviting[contact.id] ? "Sending…" : "Send Portal Invite"}
                              </Button>
                            ) : contact.matchedUser?.hasPortal ? (
                              <Button variant="ghost" size="sm" disabled>
                                Has Portal Access
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Linked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredGhlContacts.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={5}>
                          {q ? "No contacts match your search." : "No GHL contacts found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* WordPress Users Tab */}
            {activeTab === "wp" && (
              <div className="overflow-x-auto rounded-md border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Portal</th>
                      <th className="px-3 py-2">GHL Linked</th>
                      <th className="px-3 py-2">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWpUsers.map((user) => (
                      <tr key={user.id} className="border-t border-border/60">
                        <td className="px-3 py-2">{user.name}</td>
                        <td className="px-3 py-2">{user.email}</td>
                        <td className="px-3 py-2">
                          {user.hasPortal ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">No Access</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {user.ghlContactId ? (
                            <Badge variant="secondary">Linked</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not linked</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{user.roles?.join(", ") || "—"}</td>
                      </tr>
                    ))}
                    {filteredWpUsers.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={5}>
                          {q ? "No users match your search." : "No WordPress users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  // Check authentication first
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/customers"),
        permanent: false,
      },
    };
  }

  try {
    const [wpUsers, ghlContacts] = await Promise.all([
      getWordPressUsers(req).catch((err) => {
        console.error("Failed to fetch WP users:", err);
        return [];
      }),
      getGHLContacts(req).catch((err) => {
        console.error("Failed to fetch GHL contacts:", err);
        console.error("Error details:", err.message, err);
        return [];
      }),
    ]);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('GHL Contacts fetched:', ghlContacts.length, ghlContacts);
    }

    return {
      props: {
        initialWpUsers: wpUsers,
        initialGhlContacts: ghlContacts,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle authentication errors - redirect to login
    if (isAuthError(message)) {
      return {
        redirect: {
          destination: getLoginRedirect("/admin/customers"),
          permanent: false,
        },
      };
    }

    // Handle permission errors (403) - show user-friendly message
    if (isPermissionError(message)) {
      return {
        props: {
          initialWpUsers: [],
          initialGhlContacts: [],
          error: "You don't have permission to view customers. Please contact an administrator.",
        },
      };
    }

    return {
      props: {
        initialWpUsers: [],
        initialGhlContacts: [],
        error: message,
        debugInfo: process.env.NODE_ENV === 'development' ? { error: message } : null,
      },
    };
  }
}
