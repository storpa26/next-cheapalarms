import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminInvoice, useSyncInvoice } from "@/lib/react-query/hooks/admin";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { invoiceId } = router.query;
  const [locationId, setLocationId] = useState("");

  const { data, isLoading, error, refetch } = useAdminInvoice({
    invoiceId: invoiceId || null,
    locationId: locationId || undefined,
  });

  const syncMutation = useSyncInvoice();

  const invoice = data?.ok ? data : null;

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ invoiceId, locationId });
      toast.success("Invoice synced successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to sync invoice");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Invoice Details">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AdminLayout title="Invoice Details">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Error loading invoice</p>
          <p className="mt-1">{error?.message || "Invoice not found"}</p>
          <Link href="/admin/invoices" className="mt-2 inline-block text-sm underline">
            Back to Invoices
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const contact = invoice.contact || {};
  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const linkedEstimate = invoice.linkedEstimate;

  return (
    <>
      <Head>
        <title>Invoice #{invoice.invoiceNumber || invoiceId} • Admin</title>
      </Head>
      <AdminLayout title={`Invoice #${invoice.invoiceNumber || invoiceId}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{invoice.title || "INVOICE"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Invoice #{invoice.invoiceNumber || invoiceId}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    invoice.status === "paid" ? "success" :
                    invoice.status === "sent" ? "info" :
                    invoice.status === "partiallyPaid" ? "warning" :
                    invoice.status === "voided" ? "destructive" :
                    "muted"
                  }
                >
                  {invoice.status || "draft"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                  {invoice.currency || "AUD"} {invoice.total?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount Due</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {invoice.currency || "AUD"} {invoice.amountDue?.toFixed(2) || "0.00"}
                </p>
                {invoice.dueDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Line Items (Left 70%) */}
            <div className="lg:col-span-2 space-y-6">
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
                              {invoice.currency || "AUD"} {(item.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                              {invoice.currency || "AUD"} {((item.amount || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-border/60">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">Total</td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">
                            {invoice.currency || "AUD"} {invoice.total?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Payments */}
              {payments.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Payment History</h2>
                  <div className="space-y-2">
                    {payments.map((payment, idx) => (
                      <div key={payment.id || idx} className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div>
                          <p className="font-medium text-foreground">{payment.method || "Payment"}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.date ? new Date(payment.date).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {invoice.currency || "AUD"} {payment.amount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Right 30%) */}
            <div className="space-y-4">
              {/* Linked Estimate */}
              {linkedEstimate && (
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Linked Estimate</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Number:</span>{" "}
                      <Link
                        href={`/admin/estimates/${linkedEstimate.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {linkedEstimate.estimateNumber || linkedEstimate.id}
                      </Link>
                    </div>
                  </div>
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
                  <Link
                    href="/admin/invoices"
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
        destination: getLoginRedirect("/admin/invoices"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

