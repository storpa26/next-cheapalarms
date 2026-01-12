import Head from "next/head";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useCallback, useEffect, useMemo } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getWordPressUsers, getGHLContacts, matchContactsToUsers, getStatusBadge } from "@/lib/admin/services/customers-data";
import { toast } from "@/components/ui/use-toast";
import { isAuthError, isPermissionError } from "@/lib/admin/utils/error-handler";
import { useWordPressUsers, useGHLContacts } from "@/lib/react-query/hooks";
import { useDeleteUser, useDeleteGhlContact, useBulkDeleteUsers, useDeleteByEmail } from "@/lib/react-query/hooks/admin";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { BulkDeleteDialog } from "@/components/admin/BulkDeleteDialog";
import { DeleteByEmailDialog } from "@/components/admin/DeleteByEmailDialog";
import { FloatingActionBar } from "@/components/admin/FloatingActionBar";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export default function AdminCustomers({ initialWpUsers, initialGhlContacts, error, debugInfo }) {
  const [activeTab, setActiveTab] = useState("ghl"); // 'wp' | 'ghl'
  const [q, setQ] = useState("");
  const [inviting, setInviting] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteScope, setDeleteScope] = useState('both');
  const [deleteGhlContactDialogOpen, setDeleteGhlContactDialogOpen] = useState(false);
  const [ghlContactToDelete, setGhlContactToDelete] = useState(null);
  const [locationId, setLocationId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteScope, setBulkDeleteScope] = useState('both');
  const [deleteByEmailDialogOpen, setDeleteByEmailDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isHydrated, setIsHydrated] = useState(false);
  const deleteUserMutation = useDeleteUser();
  const deleteGhlContactMutation = useDeleteGhlContact();
  const bulkDeleteUsersMutation = useBulkDeleteUsers();
  const deleteByEmailMutation = useDeleteByEmail();

  // Track hydration state to prevent hydration mismatches
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use React Query hooks for data fetching (with caching)
  const {
    data: wpUsers = [],
    isLoading: loadingUsers,
    isError: wpUsersIsError,
    error: wpUsersError,
    refetch: refetchUsers,
  } = useWordPressUsers({
    enabled: true,
    initialData: initialWpUsers || [],
    // Add staleTime to prevent immediate refetch during hydration
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Prevent refetch on mount if we have initialData (prevents hydration mismatch)
    refetchOnMount: false,
  });

  const {
    data: ghlContacts = [],
    isLoading: loadingContacts,
    isError: ghlContactsIsError,
    error: ghlContactsError,
    refetch: refetchContacts,
  } = useGHLContacts({
    limit: 50,
    enabled: true,
    initialData: initialGhlContacts || [],
    // Add staleTime to prevent immediate refetch during hydration
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Prevent refetch on mount if we have initialData (prevents hydration mismatch)
    refetchOnMount: false,
  });

  const loading = loadingUsers || loadingContacts || refreshing;
  const wpErrMsg = wpUsersIsError ? (wpUsersError?.message || "Failed to load WordPress users.") : null;
  const ghlErrMsg = ghlContactsIsError ? (ghlContactsError?.message || "Failed to load GHL contacts.") : null;

  // Match contacts to users - memoize to prevent hydration issues
  // Use initial data during SSR/hydration to ensure consistency
  const matchedContacts = useMemo(() => {
    // During initial render (before hydration), use initial data to match server render
    const contactsToUse = !isHydrated ? (initialGhlContacts || []) : ghlContacts;
    const usersToUse = !isHydrated ? (initialWpUsers || []) : wpUsers;
    return matchContactsToUsers(contactsToUse, usersToUse);
  }, [ghlContacts, wpUsers, initialGhlContacts, initialWpUsers, isHydrated]);

  // Filter based on search - memoize to prevent hydration issues
  const filteredWpUsers = useMemo(() => {
    const usersToUse = !isHydrated ? (initialWpUsers || []) : wpUsers;
    if (!q?.trim()) return usersToUse;
    const s = q.toLowerCase();
    return usersToUse.filter((user) => {
      return (
        user.name?.toLowerCase().includes(s) ||
        user.email?.toLowerCase().includes(s) ||
        user.firstName?.toLowerCase().includes(s) ||
        user.lastName?.toLowerCase().includes(s)
      );
    });
  }, [wpUsers, q, initialWpUsers, isHydrated]);

  const filteredGhlContacts = useMemo(() => {
    if (!q?.trim()) return matchedContacts;
    const s = q.toLowerCase();
    return matchedContacts.filter((contact) => {
      return (
        (contact.firstName || "").toLowerCase().includes(s) ||
        (contact.lastName || "").toLowerCase().includes(s) ||
        (contact.email || "").toLowerCase().includes(s) ||
        (contact.phone || "").includes(s)
      );
    });
  }, [matchedContacts, q]);

  // Clear selection when tab or search changes
  useEffect(() => {
    setSelectedUserIds(new Set());
  }, [activeTab, q]);

  // Handle select all (WordPress users)
  const handleSelectAllUsers = useCallback((checked) => {
    if (checked) {
      setSelectedUserIds(new Set(filteredWpUsers.map((user) => String(user.id))));
    } else {
      setSelectedUserIds(new Set());
    }
  }, [filteredWpUsers]);

  // Handle individual selection (WordPress users)
  const handleSelectUser = useCallback((userId, checked) => {
    setSelectedUserIds((prev) => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(String(userId));
      } else {
        newSelected.delete(String(userId));
      }
      return newSelected;
    });
  }, []);

  // Handle bulk delete (WordPress users)
  const handleBulkDeleteUsers = useCallback(async () => {
    const userIds = Array.from(selectedUserIds).map(Number);
    if (userIds.length === 0) return;

    try {
      await bulkDeleteUsersMutation.mutateAsync({ 
        userIds, 
        locationId: locationId || undefined,
        scope: bulkDeleteScope 
      });
      setSelectedUserIds(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedUserIds, bulkDeleteUsersMutation, locationId, bulkDeleteScope]);

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

  const handleDeleteByEmail = useCallback(async (email) => {
    try {
      await deleteByEmailMutation.mutateAsync({
        email,
        locationId: locationId || undefined,
      });
      setDeleteByEmailDialogOpen(false);
      // Refresh data after deletion
      await handleRefresh();
    } catch (error) {
      // Error handled by mutation
    }
  }, [deleteByEmailMutation, locationId, handleRefresh]);

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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteByEmailDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete by Email
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
                      {ghlContactsIsError ? (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-error" colSpan={5}>
                            Failed to load GHL contacts. {ghlErrMsg}{" "}
                            <button
                              type="button"
                              className="underline"
                              onClick={() => refetchContacts()}
                            >
                              Retry
                            </button>
                          </td>
                        </tr>
                      ) : loadingContacts ? (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={5}>
                            <span className="inline-flex items-center gap-2">
                              <Spinner size="sm" />
                              Loading contacts…
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <>
                          {filteredGhlContacts.map((contact) => {
                            const badge = getStatusBadge(contact.status);
                            const name =
                              `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "No name";
                            const canInvite =
                              contact.status === "no_account" || contact.status === "needs_invite";

                            return (
                              <tr key={contact.id} className="border-t border-border/60">
                                <td className="px-3 py-2">{name}</td>
                                <td className="px-3 py-2">{contact.email || "—"}</td>
                                <td className="px-3 py-2">{contact.phone || "—"}</td>
                                <td className="px-3 py-2">
                                  <Badge variant={badge.variant}>{badge.label}</Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
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

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Delete contact from GoHighLevel"
                                      onClick={() => {
                                        setGhlContactToDelete(contact);
                                        setDeleteGhlContactDialogOpen(true);
                                      }}
                                      disabled={
                                        deleteGhlContactMutation.isPending &&
                                        ghlContactToDelete?.id === contact.id
                                      }
                                      className="text-error hover:text-error/80 hover:bg-error/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
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
                        </>
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
                        <th className="px-3 py-2">
                          <Checkbox
                            checked={filteredWpUsers.length > 0 && selectedUserIds.size === filteredWpUsers.length}
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                            aria-label="Select all"
                          />
                        </th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Portal</th>
                        <th className="px-3 py-2">GHL Linked</th>
                        <th className="px-3 py-2">Roles</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wpUsersIsError ? (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-error" colSpan={7}>
                            Failed to load WordPress users. {wpErrMsg}{" "}
                            <button
                              type="button"
                              className="underline"
                              onClick={() => refetchUsers()}
                            >
                              Retry
                            </button>
                          </td>
                        </tr>
                      ) : loadingUsers ? (
                        <tr>
                          <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={7}>
                            <span className="inline-flex items-center gap-2">
                              <Spinner size="sm" />
                              Loading users…
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <>
                          {filteredWpUsers.map((user) => {
                            const isSelected = selectedUserIds.has(String(user.id));
                            return (
                            <tr key={user.id} className={`border-t border-border/60 ${isSelected ? 'bg-primary/10' : ''}`}>
                              <td className="px-3 py-2">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                  aria-label={`Select user ${user.id}`}
                                />
                              </td>
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
                              <td className="px-3 py-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setDeleteUserDialogOpen(true);
                                  }}
                                  className="text-error hover:text-error/80 hover:bg-error/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                          })}
                          {filteredWpUsers.length === 0 && (
                            <tr>
                              <td className="px-3 py-6 text-center text-xs text-muted-foreground" colSpan={7}>
                                {q ? "No users match your search." : "No WordPress users found."}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Floating Action Bar (for WordPress users tab) */}
        {activeTab === "wp" && (
          <FloatingActionBar
            selectedCount={selectedUserIds.size}
            onClearSelection={() => setSelectedUserIds(new Set())}
            onDeleteSelected={() => setBulkDeleteDialogOpen(true)}
            isLoading={bulkDeleteUsersMutation.isPending}
          />
        )}

        {/* Bulk Delete Dialog (for WordPress users) */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          onConfirm={handleBulkDeleteUsers}
          itemCount={selectedUserIds.size}
          isLoading={bulkDeleteUsersMutation.isPending}
          showScopeSelection={true}
          scope={bulkDeleteScope}
          onScopeChange={setBulkDeleteScope}
          itemType="User"
          trashMode={false}
        />

        {/* Delete User Dialog */}
        <DeleteDialog
          open={deleteUserDialogOpen}
          onOpenChange={setDeleteUserDialogOpen}
          onConfirm={async () => {
            if (!userToDelete) return;
            try {
              await deleteUserMutation.mutateAsync({
                userId: userToDelete.id,
                locationId: locationId || undefined,
                scope: deleteScope,
              });
              setDeleteUserDialogOpen(false);
              setUserToDelete(null);
            } catch (err) {
              // Error already handled in mutation
            }
          }}
          title="Delete User/Contact"
          description={userToDelete ? `Are you sure you want to delete ${userToDelete.name || userToDelete.email}? This action cannot be undone.` : ""}
          itemName={userToDelete ? (userToDelete.name || userToDelete.email) : ""}
          isLoading={deleteUserMutation.isPending}
          showScopeSelection={true}
          scope={deleteScope}
          onScopeChange={setDeleteScope}
        />

        {/* Delete GHL Contact Dialog */}
        <DeleteDialog
          open={deleteGhlContactDialogOpen}
          onOpenChange={setDeleteGhlContactDialogOpen}
          onConfirm={async () => {
            if (!ghlContactToDelete) return;
            try {
              await deleteGhlContactMutation.mutateAsync({
                contactId: ghlContactToDelete.id,
                locationId: ghlContactToDelete.locationId,
              });
              setDeleteGhlContactDialogOpen(false);
              setGhlContactToDelete(null);
              await handleRefresh();
            } catch (err) {
              // Error already handled in mutation
            }
          }}
          title="Delete GHL Contact"
          description={
            ghlContactToDelete
              ? `Are you sure you want to delete ${ghlContactToDelete.email || ghlContactToDelete.contactName || 'this contact'} from GoHighLevel? This cannot be undone.`
              : ""
          }
          itemName={
            ghlContactToDelete
              ? (ghlContactToDelete.email || ghlContactToDelete.contactName || ghlContactToDelete.id)
              : ""
          }
          isLoading={deleteGhlContactMutation.isPending}
          showScopeSelection={false}
        />

        {/* Delete by Email Dialog */}
        <DeleteByEmailDialog
          open={deleteByEmailDialogOpen}
          onOpenChange={setDeleteByEmailDialogOpen}
          onConfirm={handleDeleteByEmail}
          isLoading={deleteByEmailMutation.isPending}
        />
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
    let wpUsers = [];
    let ghlContacts = [];
    const initialLoadErrors = {};

    try {
      wpUsers = await getWordPressUsers(ctx.req);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch WordPress users";
      initialLoadErrors.wpUsers = msg;
    }

    try {
      ghlContacts = await getGHLContacts(ctx.req);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch GHL contacts";
      initialLoadErrors.ghlContacts = msg;
    }

    const hasInitialErrors = Object.keys(initialLoadErrors).length > 0;

    return {
      props: {
        initialWpUsers: wpUsers,
        initialGhlContacts: ghlContacts,
        ...(hasInitialErrors
          ? {
              error:
                "Some customer data failed to load (usually GHL connectivity). Please try Refresh.",
              debugInfo:
                process.env.NODE_ENV === "development" ? initialLoadErrors : null,
            }
          : {}),
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
