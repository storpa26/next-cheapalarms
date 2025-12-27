import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useCallback } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getWordPressUsers, getGHLContacts, matchContactsToUsers, getStatusBadge } from "@/lib/admin/services/customers-data";
import { toast } from "@/components/ui/use-toast";
import { isAuthError, isPermissionError } from "@/lib/admin/utils/error-handler";
import { useWordPressUsers, useGHLContacts } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function AdminCustomers({ initialWpUsers, initialGhlContacts, error, debugInfo }) {
  const [activeTab, setActiveTab] = useState("ghl"); // 'wp' | 'ghl'
  const [q, setQ] = useState("");
  const [inviting, setInviting] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query hooks for data fetching (with caching)
  const { data: wpUsers = [], isLoading: loadingUsers, refetch: refetchUsers } = useWordPressUsers({
    enabled: true,
    initialData: initialWpUsers,
  });

  const { data: ghlContacts = [], isLoading: loadingContacts, refetch: refetchContacts } = useGHLContacts({
    limit: 50,
    enabled: true,
    initialData: initialGhlContacts,
  });

  const loading = loadingUsers || loadingContacts || refreshing;

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchUsers(), refetchContacts()]);
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
      setRefreshing(false);
    }
  }, [refetchUsers, refetchContacts]);

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

      // Invalidate and refetch customer data
      queryClient.invalidateQueries({ queryKey: ['wp-users'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-contacts'] });
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
          <Card className="mb-4 border border-error/30 bg-error-bg text-error">
            <CardHeader>
              <CardTitle>Error loading customers</CardTitle>
              <CardDescription>{error}</CardDescription>
              {debugInfo && (
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              )}
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
              <Input
                placeholder="Search name, email…"
                className="w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                {refreshing ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Refreshing…
                  </span>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="ghl">
                  GHL Contacts ({filteredGhlContacts.length})
                </TabsTrigger>
                <TabsTrigger value="wp">
                  WordPress Users ({filteredWpUsers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* GHL Contacts Tab */}
            <TabsContent value="ghl" className="mt-4">
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
                                {inviting[contact.id] ? (
                                  <span className="flex items-center gap-2">
                                    <Spinner size="sm" />
                                    Sending…
                                  </span>
                                ) : (
                                  "Send Portal Invite"
                                )}
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
            </TabsContent>

            {/* WordPress Users Tab */}
            <TabsContent value="wp" className="mt-4">
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
                        <td className="px-3 py-2">
                          {Array.isArray(user.roles) && user.roles.length > 0
                            ? user.roles.join(", ")
                            : "—"}
                        </td>
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
            </TabsContent>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const authCheck = await requireAdmin(ctx, { notFound: true });
  if (authCheck.notFound || authCheck.redirect) {
    return authCheck;
  }

  try {
    const [wpUsers, ghlContacts] = await Promise.all([
      getWordPressUsers(ctx.req).catch(() => []),
      getGHLContacts(ctx.req).catch(() => []),
    ]);

    return {
      props: {
        initialWpUsers: wpUsers,
        initialGhlContacts: ghlContacts,
        ...(authCheck.props || {}),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (isAuthError(message)) {
      return {
        redirect: {
          destination: "/login?from=/admin/customers",
          permanent: false,
        },
      };
    }

    if (isPermissionError(message)) {
      return {
        props: {
          initialWpUsers: [],
          initialGhlContacts: [],
          error: "You don't have permission to view customers. Please contact an administrator.",
          ...(authCheck.props || {}),
        },
      };
    }

    return {
      props: {
        initialWpUsers: [],
        initialGhlContacts: [],
        error: message,
        debugInfo: process.env.NODE_ENV === 'development' ? { error: message } : null,
        ...(authCheck.props || {}),
      },
    };
  }
}
