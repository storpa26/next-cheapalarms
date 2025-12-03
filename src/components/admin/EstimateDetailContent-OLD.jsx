import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAdminEstimate, useCreateInvoiceFromEstimate, useSendEstimate } from "@/lib/react-query/hooks/admin";
import { useEstimatePhotos } from "@/lib/react-query/hooks/use-estimate-photos";
import { PhotoGallery } from "./PhotoGallery";
import { toast } from "sonner";

export function EstimateDetailContent({ estimateId, locationId, onInvoiceCreated }) {
  const { data, isLoading, error, refetch } = useAdminEstimate({
    estimateId: estimateId || null,
    locationId: locationId || undefined,
  });

  const createInvoiceMutation = useCreateInvoiceFromEstimate();
  const sendEstimateMutation = useSendEstimate();

  const estimate = data?.ok ? data : null;
  const hasInvoice = !!(estimate?.linkedInvoice || estimate?.portalMeta?.invoice?.id);
  
  // Row selection state
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Fetch photos to determine which items have photos
  const { data: photosData } = useEstimatePhotos({
    estimateId: estimateId || undefined,
    enabled: !!estimateId,
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

  const handleCreateInvoice = async () => {
    try {
      const result = await createInvoiceMutation.mutateAsync({ estimateId, locationId });
      toast.success("Invoice created successfully");
      refetch();
      if (onInvoiceCreated) {
        onInvoiceCreated(result);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  const handleSendEstimate = async () => {
    try {
      await sendEstimateMutation.mutateAsync({ estimateId, locationId });
      toast.success("Estimate sent successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to send estimate");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-semibold">Error loading estimate</p>
        <p className="mt-1">{error?.message || "Estimate not found"}</p>
      </div>
    );
  }

  const contact = estimate.contact || {};
  const items = estimate.items || [];
  const portalMeta = estimate.portalMeta || {};
  const linkedInvoice = estimate.linkedInvoice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{estimate.title || "ESTIMATE"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimate #{estimate.estimateNumber || estimateId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                estimate.portalStatus === "accepted" ? "success" :
                estimate.portalStatus === "rejected" ? "destructive" :
                "warning"
              }
              className="text-xs font-medium"
            >
              {estimate.portalStatus || "sent"}
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
                    {items.map((item, idx) => {
                      const itemName = item.name || "Item";
                      const photoCount = itemPhotoCounts[itemName] || 0;
                      
                      // Simpler selection check - just compare by name (more reliable)
                      const isSelected = selectedItem?.name === itemName;
                      
                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            // Toggle: if clicking the same row, clear selection to show all photos
                            if (selectedItem?.name === itemName) {
                              setSelectedItem(null);
                            } else {
                              setSelectedItem({ ...item, name: itemName });
                            }
                          }}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-[#1EA6DF]/10 via-[#c95375]/5 to-[#1EA6DF]/10 ring-2 ring-[#1EA6DF]/40 shadow-sm"
                              : "hover:bg-muted/30 hover:shadow-sm"
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
                                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1EA6DF]/20 to-[#c95375]/20 px-2.5 py-1 text-xs font-semibold text-[#1EA6DF] shadow-sm border border-[#1EA6DF]/30">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            {estimate.currency || "AUD"} {(item.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {estimate.currency || "AUD"} {((item.amount || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
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
                <span className="font-medium text-foreground">{estimate.portalStatus || "sent"}</span>
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
                  {portalMeta.photos.submission_status === 'submitted' ? (
                    <span className="font-medium text-green-600 flex items-center gap-1 inline-flex">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Submitted ({portalMeta.photos.total || 0} photos)
                    </span>
                  ) : (
                    <span className="font-medium text-orange-600">
                      Pending ({portalMeta.photos.total || 0} photos)
                    </span>
                  )}
                </div>
              )}
              {portalMeta.photos?.submitted_at && (
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="text-xs text-foreground">
                    {new Date(portalMeta.photos.submitted_at).toLocaleString()}
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
                onClick={handleSendEstimate}
                disabled={sendEstimateMutation.isPending}
                className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {sendEstimateMutation.isPending ? "Sending..." : "Send Estimate"}
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
            </div>
          </div>

          {/* Photos Gallery */}
          <PhotoGallery
            estimateId={estimateId}
            items={items}
            selectedItem={selectedItem}
            portalMeta={portalMeta}
          />
        </div>
      </div>
    </div>
  );
}

