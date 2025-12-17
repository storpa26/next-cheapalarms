import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DEFAULT_CURRENCY } from "@/lib/admin/constants";
import { 
  useAdminEstimate, 
  useCreateInvoiceFromEstimate, 
  useSendEstimate,
  useUpdateEstimate,
  useCompleteReview,
  useSendRevisionNotification
} from "@/lib/react-query/hooks/admin";
import { useEstimatePhotos } from "@/lib/react-query/hooks/use-estimate-photos";
import { PhotoGallery } from "./PhotoGallery";
import { AddCustomItemModal } from "./AddCustomItemModal";
import { DiscountModal } from "./DiscountModal";
import { ChangeSummary } from "./ChangeSummary";
import { SaveEstimateModal } from "./SaveEstimateModal";
import { WorkflowStatusCard } from "./WorkflowStatusCard";
import { toast } from "sonner";

export function EstimateDetailContent({ estimateId, locationId, onInvoiceCreated }) {
  const { data, isLoading, error, refetch } = useAdminEstimate({
    estimateId: estimateId || null,
    locationId: locationId || undefined,
  });

  const createInvoiceMutation = useCreateInvoiceFromEstimate();
  const sendEstimateMutation = useSendEstimate();
  const updateEstimateMutation = useUpdateEstimate();
  const completeReviewMutation = useCompleteReview();
  const sendRevisionMutation = useSendRevisionNotification(); // Separate hook for revision notifications

  const estimate = data?.ok ? data : null;
  const hasInvoice = !!(estimate?.linkedInvoice || estimate?.portalMeta?.invoice?.id);
  
  // Row selection state (for photos)
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [editedDiscount, setEditedDiscount] = useState(null);
  const [removedItems, setRemovedItems] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
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

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    if (!isEditMode) return;
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode]);

  // Initialize edited items when entering edit mode
  const handleEnterEditMode = () => {
    const items = estimate?.items || [];
    setEditedItems(items.map(item => ({ ...item, originalQty: item.qty || item.quantity || 1 })));
    setEditedDiscount(estimate?.discount || null);
    setRemovedItems([]);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedItems([]);
    setEditedDiscount(null);
    setRemovedItems([]);
  };

  const handleSaveClick = () => {
    // Validation
    if (editedItems.length === 0) {
      toast.error("Cannot save estimate with no items");
      return;
    }
    
    const invalidItems = editedItems.filter(item => {
      const qty = item.qty || item.quantity || 0;
      const amount = item.amount || 0;
      return amount <= 0 || qty <= 0;
    });
    
    if (invalidItems.length > 0) {
      toast.error("All items must have positive price and quantity");
      return;
    }
    
    // Show save confirmation modal
    setShowSaveModal(true);
  };

  const handleConfirmSave = async ({ adminNote, sendNotification }) => {
    try {
      // Calculate revision data with validation for NaN/Infinity
      const safeOldTotal = isFinite(originalTotal) ? originalTotal : 0;
      const safeNewTotal = isFinite(newTotal) ? newTotal : 0;
      const safeNetChange = isFinite(safeNewTotal) && isFinite(safeOldTotal) 
        ? safeNewTotal - safeOldTotal 
        : 0;
      
      const revisionData = {
        revisedAt: new Date().toISOString(),
        adminNote,
        oldTotal: safeOldTotal,
        newTotal: safeNewTotal,
        netChange: safeNetChange,
        changedItems: changedItems.map(item => ({
          name: item.name,
          oldQty: item.originalQty,
          newQty: item.newQty
        })),
        addedItems: addedItems.map(item => ({
          name: item.name,
          qty: item.qty || 1,
          amount: item.amount
        })),
        removedItems: removedItems.map(item => ({
          name: item.name,
          qty: item.qty || item.quantity || 1,
          amount: item.amount
        })),
        discount: editedDiscount
      };

      // 1. Update estimate (one API call)
      await updateEstimateMutation.mutateAsync({
        estimateId,
        locationId,
        items: editedItems.map(item => ({
          name: item.name,
          description: item.description,
          currency: item.currency || estimate.currency || DEFAULT_CURRENCY,
          amount: item.amount,
          qty: item.qty || item.quantity || 1
        })),
        discount: editedDiscount,
        revisionData, // Send revision data to backend
      });
      
      setShowSaveModal(false);
      toast.success("Estimate updated successfully");
      setIsEditMode(false);
      
      // 2. Send notification (if requested) - using separate hook to avoid button confusion
      if (sendNotification) {
        try {
          await sendRevisionMutation.mutateAsync({ 
            estimateId, 
            locationId,
            revisionNote: adminNote,
            revisionData 
          });
          toast.success("Customer notified of estimate update");
        } catch (err) {
          toast.error("Estimate saved but failed to notify customer");
        }
      } else if (estimate.portalStatus === 'sent') {
        // Remind admin to send estimate if customer hasn't accepted yet
        toast.info("Don't forget to send the updated estimate to the customer!", {
          duration: 5000,
          action: {
            label: 'Send Now',
            onClick: () => handleSendEstimate()
          }
        });
      }
      
      // 3. Refetch ONCE at the end (after everything is done) - optimized
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update estimate");
      // Refetch on error to ensure UI shows current state
      refetch();
    }
  };

  const handleQuantityChange = (index, delta) => {
    setEditedItems(prev => {
      // Bounds check: ensure index is valid
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      
      const newItems = [...prev];
      const currentQty = newItems[index].qty || newItems[index].quantity || 1;
      const originalQty = newItems[index].originalQty || currentQty;
      
      // Calculate min/max based on original quantity
      const minQty = Math.max(1, originalQty - 10);
      const maxQty = originalQty + 10;
      
      // Apply delta and constrain to limits
      const newQty = Math.max(minQty, Math.min(currentQty + delta, maxQty));
      
      newItems[index] = { ...newItems[index], qty: newQty, quantity: newQty };
      return newItems;
    });
  };

  const handleRemoveItemClick = (index) => {
    // Bounds check: ensure index is valid
    if (index < 0 || index >= editedItems.length) {
      return;
    }
    setItemToDeleteIndex(index);
    setDeleteItemDialogOpen(true);
  };

  const handleRemoveItem = (index) => {
    const item = editedItems[index];
    // Track removed items if they were original (not custom added)
    if (item && !item.isCustom) {
      setRemovedItems(prev => [...prev, item]);
    }
    setEditedItems(prev => prev.filter((_, i) => i !== index));
    setDeleteItemDialogOpen(false);
    setItemToDeleteIndex(null);
  };

  const handleAddCustomItem = (newItem) => {
    setEditedItems(prev => [...prev, newItem]);
  };

  const handleApplyDiscount = (discount) => {
    setEditedDiscount(discount);
  };

  // Calculate totals
  const originalTotal = estimate?.total || 0;
  const newTotal = useMemo(() => {
    const itemsTotal = editedItems.reduce((sum, item) => {
      return sum + (item.amount * (item.qty || item.quantity || 1));
    }, 0);
    
    if (editedDiscount && editedDiscount.value !== 0) {
      if (editedDiscount.type === 'percentage') {
        // For percentage: positive = discount, negative = surcharge
        return itemsTotal * (1 - editedDiscount.value / 100);
      } else {
        // For fixed: positive = discount, negative = surcharge
        return itemsTotal - editedDiscount.value;
      }
    }
    
    return itemsTotal;
  }, [editedItems, editedDiscount]);

  // Detect changes
  const changedItems = useMemo(() => {
    if (!isEditMode) return [];
    const original = estimate?.items || [];
    return editedItems
      .filter((edited, idx) => {
        const orig = original[idx];
        return orig && (edited.qty || edited.quantity) !== (orig.qty || orig.quantity);
      })
      .map((edited, idx) => ({
        name: edited.name,
        originalQty: edited.originalQty,
        newQty: edited.qty || edited.quantity
      }));
  }, [isEditMode, editedItems, estimate]);

  const addedItems = useMemo(() => {
    if (!isEditMode) return [];
    const originalCount = estimate?.items?.length || 0;
    return editedItems.slice(originalCount);
  }, [isEditMode, editedItems, estimate]);

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

  const handleCompleteReview = async () => {
    try {
      await completeReviewMutation.mutateAsync({ estimateId, locationId });
      toast.success("Review completed! Customer has been notified.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to complete review");
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
      <div className="rounded-md border border-error/30 bg-error-bg p-4 text-sm text-error">
        <p className="font-semibold">Error loading estimate</p>
        <p className="mt-1">{error?.message || "Estimate not found"}</p>
      </div>
    );
  }

  const contact = estimate.contact || {};
  const items = isEditMode ? editedItems : (estimate.items || []);
  const portalMeta = estimate.portalMeta || {};
  const linkedInvoice = estimate.linkedInvoice;
  const currency = estimate.currency || DEFAULT_CURRENCY;

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
              {currency} {(isEditMode ? newTotal : originalTotal).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Items (Left 70%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Edit Mode Controls */}
          {!isEditMode && !hasInvoice && (estimate.portalStatus === 'sent' || portalMeta.photos?.submission_status === 'submitted') && (
            <div className="rounded-xl border border-info/30 bg-info-bg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-info">Ready for Review</p>
                    <p className="text-sm text-info">
                      {estimate.portalStatus === 'accepted' 
                        ? 'Customer accepted and submitted photos. You can still adjust based on photos. Re-send estimate if you make changes.'
                        : portalMeta.photos?.submission_status === 'submitted'
                        ? 'Customer submitted photos. Review and adjust pricing, then send updated estimate to customer for acceptance.'
                        : 'Estimate is ready. You can edit and adjust pricing before sending to customer.'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleEnterEditMode}
                  variant="gradient"
                  className="whitespace-nowrap"
                >
                  Edit Estimate
                </Button>
              </div>
            </div>
          )}
          
          {/* Info banner when invoice already created */}
          {hasInvoice && portalMeta.photos?.submission_status === 'submitted' && (
            <div className="rounded-xl border border-warning/30 bg-warning-bg p-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-warning">Invoice Created</p>
                  <p className="text-sm text-warning">
                    An invoice has already been created for this estimate. To make changes, edit the estimate in GHL and create a new invoice.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Change Summary (only in edit mode) */}
          {isEditMode && (
            <ChangeSummary
              originalTotal={originalTotal}
              newTotal={newTotal}
              changedItems={changedItems}
              addedItems={addedItems}
              removedItems={removedItems}
              discount={editedDiscount}
              currency={currency}
            />
          )}

          {/* Line Items Table */}
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
              {isEditMode && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddItemModal(true)}
                    variant="default"
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </Button>
                  <Button
                    onClick={() => setShowDiscountModal(true)}
                    variant="default"
                    size="sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Discount/Fee
                  </Button>
                </div>
              )}
            </div>
            
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/60">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Item</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Total</th>
                      {isEditMode && (
                        <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item, idx) => {
                      const itemName = item.name || "Item";
                      const photoCount = itemPhotoCounts[itemName] || 0;
                      const itemQty = item.qty || item.quantity || 1;
                      const isSelected = !isEditMode && selectedItem?.name === itemName;
                      
                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => {
                            // Allow photo viewing even in edit mode
                            if (selectedItem?.name === itemName) {
                              setSelectedItem(null);
                            } else {
                              setSelectedItem({ ...item, name: itemName });
                            }
                          }}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                              : "hover:bg-muted/30 hover:shadow-sm"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-foreground flex items-center gap-2">
                                  {itemName}
                                  {item.isCustom && (
                                    <span className="text-xs px-1.5 py-0.5 bg-success-bg text-success rounded font-semibold">NEW</span>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                              {!isEditMode && photoCount > 0 && (
                                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/30">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{photoCount}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isEditMode ? (
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  onClick={() => handleQuantityChange(idx, -1)}
                                  disabled={itemQty <= 1}
                                  variant="outline"
                                  size="icon-sm"
                                  className="w-7 h-7"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </Button>
                                <span className="w-10 text-center font-medium text-foreground">{itemQty}</span>
                                <Button
                                  onClick={() => handleQuantityChange(idx, 1)}
                                  disabled={itemQty >= (item.originalQty || 1) + 10}
                                  variant="outline"
                                  size="icon-sm"
                                  className="w-7 h-7"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center text-sm text-foreground">{itemQty}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">
                            {currency} {(item.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                            {currency} {((item.amount || 0) * itemQty).toFixed(2)}
                          </td>
                          {isEditMode && (
                            <td className="px-4 py-3 text-center">
                              <Button
                                onClick={() => handleRemoveItemClick(idx)}
                                variant="ghost"
                                size="icon-sm"
                                className="text-error hover:text-error/80"
                                title="Remove item"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-border/60">
                    <tr>
                      <td colSpan={isEditMode ? 4 : 3} className="px-4 py-3 text-right font-semibold text-foreground">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        {currency} {(isEditMode ? newTotal : originalTotal).toFixed(2)}
                      </td>
                      {isEditMode && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Save/Cancel Buttons */}
            {isEditMode && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-border/60">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveClick}
                  disabled={updateEstimateMutation.isPending}
                  variant="gradient"
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Right 30%) - Keep existing sidebar code */}
        <div className="space-y-4">
          {/* Workflow Status Card - NEW */}
          {portalMeta.workflow?.status && (
            <WorkflowStatusCard
              workflow={portalMeta.workflow}
              booking={portalMeta.booking}
              payment={portalMeta.payment}
            />
          )}

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
                    <span className="font-medium text-success inline-flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Submitted ({portalMeta.photos.total || 0} photos)
                    </span>
                  ) : (
                    <span className="font-medium text-muted-foreground">Pending</span>
                  )}
                </div>
              )}
              {portalMeta.photos?.submitted_at && (
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="font-medium text-foreground">
                    {new Date(portalMeta.photos.submitted_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Linked Invoice */}
          {linkedInvoice && (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Linked Invoice</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Number:</span>{" "}
                  <span className="font-medium text-foreground">{linkedInvoice.number || linkedInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium text-foreground">{linkedInvoice.status || "draft"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Due:</span>{" "}
                  <span className="font-medium text-foreground">
                    {currency} {linkedInvoice.amountDue?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
            <div className="space-y-2">
              {estimate.id && (
                <a
                  href={`https://app.gohighlevel.com/v2/location/${locationId || estimate.locationId}/estimates/${estimate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View in GHL
                </a>
              )}
              {/* Complete Review button - show when workflow is "reviewing" and photos are submitted */}
              {portalMeta.workflow?.status === 'reviewing' && portalMeta.photos?.submission_status === 'submitted' && (
                <Button
                  onClick={handleCompleteReview}
                  disabled={completeReviewMutation.isPending}
                  variant="default"
                  className="w-full"
                >
                  {completeReviewMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Review
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleSendEstimate}
                disabled={sendEstimateMutation.isPending}
                variant="default"
                className="w-full bg-success text-success-foreground hover:bg-success/90"
              >
                {sendEstimateMutation.isPending ? "Sending..." : "Send Estimate"}
              </Button>
              {!hasInvoice && estimate.portalStatus === "accepted" && (
                <Button
                  onClick={handleCreateInvoice}
                  disabled={createInvoiceMutation.isPending}
                  variant="default"
                  className="w-full"
                >
                  {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <PhotoGallery
            estimateId={estimateId}
            items={estimate.items || []}
            selectedItem={selectedItem}
            portalMeta={portalMeta}
          />
        </div>
      </div>

      {/* Modals */}
      <AddCustomItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAdd={handleAddCustomItem}
        currency={currency}
      />

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onApply={handleApplyDiscount}
        currentDiscount={editedDiscount}
        estimateTotal={editedItems.reduce((sum, item) => sum + (item.amount * (item.qty || item.quantity || 1)), 0)}
        currency={currency}
      />

      <SaveEstimateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        changedItems={changedItems}
        addedItems={addedItems}
        removedItems={removedItems}
        discount={editedDiscount}
        originalTotal={originalTotal}
        newTotal={newTotal}
        currency={currency}
        isSaving={updateEstimateMutation.isPending}
      />

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={deleteItemDialogOpen} onOpenChange={setDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDeleteIndex !== null && handleRemoveItem(itemToDeleteIndex)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

