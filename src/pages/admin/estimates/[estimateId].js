import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminEstimate, useSyncEstimate, useCreateInvoiceFromEstimate } from "@/lib/react-query/hooks/admin";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function EstimateDetailPage() {
  const router = useRouter();
  const { estimateId } = router.query;
  const [locationId, setLocationId] = useState("");

  const { data, isLoading, error, refetch } = useAdminEstimate({
    estimateId: estimateId || null,
    locationId: locationId || undefined,
  });

  const syncMutation = useSyncEstimate();
  const createInvoiceMutation = useCreateInvoiceFromEstimate();

  const estimate = data?.ok ? data : null;
  const hasInvoice = !!(estimate?.linkedInvoice || estimate?.portalMeta?.invoice?.id);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ estimateId, locationId });
      toast.success("Estimate synced successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to sync estimate");
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const result = await createInvoiceMutation.mutateAsync({ estimateId, locationId });
      toast.success("Invoice created successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Estimate Details">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (error || !estimate) {
    return (
      <AdminLayout title="Estimate Details">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Error loading estimate</p>
          <p className="mt-1">{error?.message || "Estimate not found"}</p>
          <Link href="/admin/estimates" className="mt-2 inline-block text-sm underline">
            Back to Estimates
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const contact = estimate.contact || {};
  const items = estimate.items || [];
  const portalMeta = estimate.portalMeta || {};
  const linkedInvoice = estimate.linkedInvoice;

  return (
    <>
      <Head>
        <title>Estimate #{estimate.estimateNumber || estimateId} • Admin</title>
      </Head>
      <AdminLayout title={`Estimate #${estimate.estimateNumber || estimateId}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{estimate.title || "ESTIMATE"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estimate #{estimate.estimateNumber || estimateId}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    estimate.ghlStatus === "accepted" ? "success" :
                    estimate.ghlStatus === "sent" ? "info" :
                    "muted"
                  }
                >
                  GHL: {estimate.ghlStatus || "draft"}
                </Badge>
                <Badge
                  variant={
                    estimate.portalStatus === "accepted" ? "success" :
                    estimate.portalStatus === "rejected" ? "destructive" :
                    "warning"
                  }
                >
                  Portal: {estimate.portalStatus || "pending"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
                <p className="mt-1 font-medium text-foreground">{contact.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{contact.email || ""}</p>
                {contact.phone && (
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {estimate.currency || "AUD"} {estimate.total?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Line Items (Left 70%) */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border/60 bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Line Items</h2>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/60">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Item</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{item.name || "Item"}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-foreground">{item.qty || item.quantity || 1}</td>
                            <td className="px-4 py-3 text-right text-sm text-foreground">
                              {estimate.currency || "AUD"} {(item.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                              {estimate.currency || "AUD"} {((item.amount || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-border/60">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">Total</td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">
                            {estimate.currency || "AUD"} {estimate.total?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (Right 30%) */}
            <div className="space-y-4">
              {/* Portal Meta */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Portal Status</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className="font-medium text-foreground">{estimate.portalStatus || "pending"}</span>
                  </div>
                  {portalMeta.acceptedAt && (
                    <div>
                      <span className="text-muted-foreground">Accepted:</span>{" "}
                      <span className="font-medium text-foreground">
                        {new Date(portalMeta.acceptedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {portalMeta.photos && (
                    <div>
                      <span className="text-muted-foreground">Photos:</span>{" "}
                      <span className="font-medium text-foreground">
                        {portalMeta.photos.total || 0} of {portalMeta.photos.required || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Invoice */}
              {hasInvoice && (
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Linked Invoice</h3>
                  {linkedInvoice ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Number:</span>{" "}
                        <Link
                          href={`/admin/invoices/${linkedInvoice.id}`}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {linkedInvoice.invoiceNumber || linkedInvoice.id}
                        </Link>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <span className="font-medium text-foreground">{linkedInvoice.status || "draft"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount Due:</span>{" "}
                        <span className="font-medium text-foreground">
                          {linkedInvoice.currency || "AUD"} {linkedInvoice.amountDue?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Invoice ID: {portalMeta.invoice?.id || "N/A"}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleSync}
                    disabled={syncMutation.isPending}
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted/40 disabled:opacity-50"
                  >
                    {syncMutation.isPending ? "Syncing..." : "Sync from GHL"}
                  </button>
                  {!hasInvoice && (
                    <button
                      onClick={handleCreateInvoice}
                      disabled={createInvoiceMutation.isPending}
                      className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                    </button>
                  )}
                  <Link
                    href="/admin/estimates"
                    className="block w-full rounded-md border border-border/60 bg-background px-3 py-2 text-center text-sm font-medium transition hover:bg-muted/40"
                  >
                    Back to List
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/estimates"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

