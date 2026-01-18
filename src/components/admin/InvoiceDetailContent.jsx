import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { useAdminInvoice, useSendInvoice, useSyncInvoiceToXero, useXeroStatus, useDeleteInvoice } from "../../lib/react-query/hooks/admin";
import { useEstimatePhotos } from "../../lib/react-query/hooks/use-estimate-photos";
import { PhotoGallery } from "./PhotoGallery";
import { DeleteDialog } from "./DeleteDialog";
import { DEFAULT_CURRENCY } from "../../lib/admin/constants";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function InvoiceDetailContent({ invoiceId, locationId }) {
  const { data, isLoading, error, refetch } = useAdminInvoice({
    invoiceId: invoiceId || null,
    locationId: locationId || undefined,
  });

  const sendInvoiceMutation = useSendInvoice();
  const syncToXeroMutation = useSyncInvoiceToXero();
  const deleteInvoiceMutation = useDeleteInvoice();
  const { data: xeroStatus } = useXeroStatus();
  const isXeroConnected = xeroStatus?.ok && xeroStatus?.connected;

  const invoice = data?.ok ? data : null;
  const linkedEstimate = invoice?.linkedEstimate;
  
  // Row selection state
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteInvoiceDialogOpen, setDeleteInvoiceDialogOpen] = useState(false);
  const [deleteScope, setDeleteScope] = useState('both');
  
  // Fetch photos from linked estimate (photos are stored against estimates, not invoices)
  // Always try to fetch - even if linkedEstimate is not yet available (it might load later)
  const estimateIdForPhotos = linkedEstimate?.id || invoice?.linkedEstimateId || null;
  const { data: photosData, isLoading: photosLoading } = useEstimatePhotos({
    estimateId: estimateIdForPhotos || undefined,
    enabled: !!estimateIdForPhotos,
  });
  
  // Calculate photo counts per item
  const itemPhotoCounts = useMemo(() => {
    if (!photosData?.ok) return {};
    
    const counts = {};
    const uploads = photosData.stored?.uploads || [];
    
    uploads.forEach((upload) => {
      const itemName = upload.itemName || "Unknown";
      counts[itemName] = (counts[itemName] || 0) + 1;
    });
    
    return counts;
  }, [photosData]);

  const handleSendInvoice = async () => {
    try {
      await sendInvoiceMutation.mutateAsync({ invoiceId, locationId });
      toast.success("Invoice sent successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to send invoice");
    }
  };

  const handleSyncToXero = async () => {
    if (!isXeroConnected) {
      toast.error("Xero is not connected. Please connect Xero first in Settings > Integrations.");
      return;
    }

    try {
      const result = await syncToXeroMutation.mutateAsync({ invoiceId, locationId });
      if (result?.ok) {
        toast.success(`Invoice synced to Xero successfully${result.xeroInvoiceNumber ? ` (Invoice #${result.xeroInvoiceNumber})` : ''}`);
        refetch();
      } else {
        throw new Error(result?.message || "Failed to sync invoice to Xero");
      }
    } catch (err) {
      toast.error(err.message || "Failed to sync invoice to Xero");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-md border border-error/50 bg-error-bg p-4 text-sm text-error">
        <p className="font-semibold">Error loading invoice</p>
        <p className="mt-1">{error?.message || "Invoice not found"}</p>
      </div>
    );
  }

  const contact = invoice.contact || {};
  const items = invoice.items || [];
  const payments = invoice.payments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{invoice.title || "INVOICE"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoice #{invoice.invoiceNumber || invoiceId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                invoice.portalStatus === "paid" ? "success" :
                invoice.portalStatus === "partial" ? "warning" :
                invoice.portalStatus === "accepted" ? "success" :
                invoice.portalStatus === "rejected" ? "destructive" :
                "warning"
              }
              className="text-xs font-medium"
            >
              {invoice.portalStatus === "partial" ? "Partially Paid" : (invoice.portalStatus || "sent")}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
            <p className="mt-1 font-medium text-foreground">{contact.name || "N/A"}</p>
            <p className="text-sm text-muted-foreground">{contact.email || ""}</p>
            {contact.phone && (
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Issue Date</p>
            <p className="mt-1 font-medium text-foreground">
              {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "N/A"}
            </p>
            {invoice.dueDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice Total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {invoice.currency || DEFAULT_CURRENCY} {invoice.total?.toFixed(2) || "0.00"}
            </p>
            {payments.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining Balance</p>
            <p className={`mt-1 text-2xl font-bold ${
              invoice.amountDue === 0 ? 'text-success' : 
              invoice.amountDue > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date() ? 'text-error' :
              'text-warning'
            }`}>
              {invoice.currency || DEFAULT_CURRENCY} {invoice.amountDue?.toFixed(2) || "0.00"}
            </p>
            {invoice.amountDue === 0 && (
              <p className="mt-1 text-xs text-success">Fully paid</p>
            )}
            {invoice.amountDue > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date() && (
              <p className="mt-1 text-xs text-error">Overdue</p>
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
                    {items.map((item, idx) => {
                      const itemName = item.name || "Item";
                      const photoCount = itemPhotoCounts[itemName] || 0;
                      // Improved selection matching - check both id and name
                      const isSelected = selectedItem && (
                        (selectedItem.id && item.id && selectedItem.id === item.id) ||
                        (selectedItem.name === itemName && (!selectedItem.id || !item.id || selectedItem.id === item.id))
                      );
                      
                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            // Toggle selection - if same item clicked, deselect
                            if (isSelected) {
                              setSelectedItem(null);
                            } else {
                              setSelectedItem(item);
                            }
                          }}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "bg-info-bg ring-2 ring-info/50"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{itemName}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                              {photoCount > 0 && (
                                <div className="flex items-center gap-1 rounded-full bg-info-bg px-2 py-0.5 text-xs text-info">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{photoCount}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">{item.qty || item.quantity || 1}</td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">
                            {invoice.currency || DEFAULT_CURRENCY} {(item.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {invoice.currency || DEFAULT_CURRENCY} {((item.amount || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-border/60">
                    {invoice.subtotal > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-foreground">Subtotal</td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {invoice.currency || DEFAULT_CURRENCY} {invoice.subtotal?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    )}
                    {invoice.tax > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-foreground">Tax</td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {invoice.currency || DEFAULT_CURRENCY} {invoice.tax?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    )}
                    {invoice.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-foreground">Discount</td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          -{invoice.currency || DEFAULT_CURRENCY} {invoice.discount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-foreground">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        {invoice.currency || DEFAULT_CURRENCY} {invoice.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
              {payments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {payments.length === 0 ? (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, idx) => {
                  const paymentDate = payment.date || payment.paidAt;
                  const isRefunded = payment.refunded === true;
                  const paymentProvider = payment.provider || payment.method || 'Unknown';
                  
                  return (
                    <div 
                      key={payment.id || payment.transactionId || idx} 
                      className={`rounded-lg border p-4 transition ${
                        isRefunded 
                          ? 'border-error/30 bg-error-bg/30' 
                          : 'border-border/60 bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {invoice.currency || DEFAULT_CURRENCY} {payment.amount?.toFixed(2) || "0.00"}
                            </p>
                            {isRefunded && (
                              <Badge variant="destructive" className="text-xs">
                                Refunded
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="capitalize">{paymentProvider}</span>
                            {paymentDate && (
                              <span>
                                {new Date(paymentDate).toLocaleString('en-AU', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            {payment.transactionId && (
                              <span className="font-mono text-xs">
                                {payment.transactionId.length > 20 
                                  ? `${payment.transactionId.substring(0, 20)}...` 
                                  : payment.transactionId}
                              </span>
                            )}
                          </div>
                          {isRefunded && payment.refundAmount && (
                            <p className="mt-1 text-xs text-error">
                              Refunded: {invoice.currency || DEFAULT_CURRENCY} {payment.refundAmount?.toFixed(2) || "0.00"}
                              {payment.refundedAt && (
                                <span className="ml-2">
                                  on {new Date(payment.refundedAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {isRefunded ? (
                            <XCircle className="h-5 w-5 text-error" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Payment Summary */}
                <div className="mt-4 rounded-lg border-2 border-border/60 bg-card p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Paid</p>
                      <p className="mt-1 text-lg font-semibold text-success">
                        {invoice.currency || DEFAULT_CURRENCY} {(
                          payments
                            .filter(p => !p.refunded)
                            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Balance</p>
                      <p className={`mt-1 text-lg font-semibold ${
                        invoice.amountDue === 0 ? 'text-success' : 'text-foreground'
                      }`}>
                        {invoice.currency || DEFAULT_CURRENCY} {invoice.amountDue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                    className="font-medium text-info hover:underline"
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
                onClick={handleSendInvoice}
                disabled={sendInvoiceMutation.isPending}
                className="w-full rounded-md bg-success px-3 py-2 text-sm font-medium text-success-foreground transition hover:bg-success/90 disabled:opacity-50"
              >
                {sendInvoiceMutation.isPending ? "Sending..." : "Send Invoice"}
              </button>
              
              {/* Xero Sync Status */}
              <div className="pt-2 border-t border-border/60">
                <div className="mb-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">Xero Sync Status</span>
                    {isXeroConnected ? (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  {invoice.xeroInvoiceId && (
                    <p className="text-xs text-muted-foreground">
                      Xero Invoice ID: <span className="font-mono">{invoice.xeroInvoiceId}</span>
                    </p>
                  )}
                  {invoice.xeroInvoiceNumber && (
                    <p className="text-xs text-muted-foreground">
                      Xero Invoice #: <span className="font-semibold">{invoice.xeroInvoiceNumber}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSyncToXero}
                  disabled={syncToXeroMutation.isPending || !isXeroConnected}
                  className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncToXeroMutation.isPending ? "Syncing..." : "Sync to Xero"}
                </button>
                {!isXeroConnected && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    <Link href="/admin/integrations" className="text-primary hover:underline">
                      Connect Xero
                    </Link> to sync invoices
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-border/60">
                <button
                  onClick={() => setDeleteInvoiceDialogOpen(true)}
                  className="w-full rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Photos Gallery - always show, even if no linked estimate yet */}
          <PhotoGallery
            estimateId={estimateIdForPhotos}
            items={items}
            selectedItem={selectedItem}
          />
        </div>
      </div>

      {/* Delete Invoice Dialog */}
      <DeleteDialog
        open={deleteInvoiceDialogOpen}
        onOpenChange={setDeleteInvoiceDialogOpen}
        onConfirm={async () => {
          try {
            await deleteInvoiceMutation.mutateAsync({
              invoiceId,
              locationId: locationId || invoice?.locationId,
              scope: deleteScope,
            });
          } catch (err) {
            // Error already handled in mutation
          }
        }}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice #${invoice?.invoiceNumber || invoiceId}? This action cannot be undone.`}
        itemName={`invoice #${invoice?.invoiceNumber || invoiceId}`}
        isLoading={deleteInvoiceMutation.isPending}
        showScopeSelection={true}
        scope={deleteScope}
        onScopeChange={setDeleteScope}
      />
    </div>
  );
}

