import { useState, useMemo, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { DEFAULT_CURRENCY } from "../../lib/admin/constants";
import { parseWpFetchError } from "../../lib/admin/utils/error-handler";
import { 
  useAdminEstimate, 
  useCreateInvoiceFromEstimate, 
  useSendEstimate,
  useUpdateEstimate,
  useCompleteReview,
  useRequestChanges,
  useSendRevisionNotification,
  useDeleteEstimate
} from "../../lib/react-query/hooks/admin";
import { computeUIState } from "../../lib/portal/status-computer";
import { useEstimatePhotos } from "../../lib/react-query/hooks/use-estimate-photos";
import { PhotoGallery } from "./PhotoGallery";
import { AddCustomItemModal } from "./AddCustomItemModal";
import { DiscountModal } from "./DiscountModal";
import { ChangeSummary } from "./ChangeSummary";
import { SaveEstimateModal } from "./SaveEstimateModal";
import { WorkflowStatusCard } from "./WorkflowStatusCard";
import { DeleteDialog } from "./DeleteDialog";
import JobDetailModal from "../servicem8/JobDetailModal";
import { toast } from "sonner";
import { Trash2, User, Mail, Phone, CheckCircle2, DollarSign, Calendar, Send } from "lucide-react";

// Memoized table row component for performance
const EstimateTableRow = memo(function EstimateTableRow({
  item,
  idx,
  photoCount,
  isSelected,
  currency,
  isEditMode,
  itemQty,
  onQuantityChange,
  onRemoveClick,
  onSelect
}) {
  const itemName = item?.name || "Item";
  
  const rowClassName = useMemo(() => {
    if (isEditMode) {
      return "transition-all duration-200";
    }
    return `cursor-pointer transition-all duration-200 ${
      isSelected
        ? "bg-primary/10 ring-2 ring-primary/40 shadow-sm"
        : "hover:bg-muted/30 hover:shadow-sm"
    }`;
  }, [isSelected, isEditMode]);

  const handleRowClick = useCallback(() => {
    if (!isEditMode && onSelect) {
      if (isSelected) {
        onSelect(null);
      } else {
        onSelect({ ...item, name: itemName });
      }
    }
  }, [isEditMode, isSelected, item, itemName, onSelect]);

  return (
    <tr
      onClick={handleRowClick}
      className={rowClassName}
      role={!isEditMode ? "button" : undefined}
      tabIndex={!isEditMode ? 0 : undefined}
      aria-selected={!isEditMode ? isSelected : undefined}
      onKeyDown={!isEditMode ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      } : undefined}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="font-medium text-foreground flex items-center gap-2">
              {itemName}
              {item?.isCustom && (
                <span className="text-xs px-1.5 py-0.5 bg-success-bg text-success rounded font-semibold">NEW</span>
              )}
            </div>
            {item?.description && (
              <div className="text-xs text-muted-foreground">{item?.description}</div>
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
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(idx, -1);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(idx, 1);
              }}
              disabled={itemQty >= (item?.originalQty || 1) + 10}
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
        {currency} {(Number(item?.amount) || 0).toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
        {currency} {((Number(item?.amount) || 0) * itemQty).toFixed(2)}
      </td>
      {isEditMode && (
        <td className="px-4 py-3 text-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveClick(idx);
            }}
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
});
EstimateTableRow.displayName = 'EstimateTableRow';

export const EstimateDetailContent = memo(function EstimateDetailContent({ estimateId, locationId, onInvoiceCreated }) {
  const { data, isLoading, error, refetch } = useAdminEstimate({
    estimateId: estimateId || null,
    locationId: locationId || undefined,
  });

  const createInvoiceMutation = useCreateInvoiceFromEstimate();
  const sendEstimateMutation = useSendEstimate();
  const updateEstimateMutation = useUpdateEstimate();
  const completeReviewMutation = useCompleteReview();
  const requestChangesMutation = useRequestChanges();
  const sendRevisionMutation = useSendRevisionNotification(); // Separate hook for revision notifications
  const deleteEstimateMutation = useDeleteEstimate();

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
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);
  const [deleteEstimateDialogOpen, setDeleteEstimateDialogOpen] = useState(false);
  const [deleteScope, setDeleteScope] = useState('both');
  
  // ServiceM8 state
  const [jobLink, setJobLink] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loadingJobLink, setLoadingJobLink] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  
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

  // Fetch ServiceM8 job link
  useEffect(() => {
    if (!estimateId) return;
    
    const fetchJobLink = async () => {
      setLoadingJobLink(true);
      try {
        const res = await fetch(`/api/servicem8/jobs/link?estimateId=${encodeURIComponent(estimateId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.link) {
            setJobLink(data.link);
            
            // Fetch job details if jobUuid exists
            if (data.link.jobUuid) {
              const jobRes = await fetch(`/api/servicem8/jobs/${data.link.jobUuid}`);
              if (jobRes.ok) {
                const jobData = await jobRes.json();
                if (jobData.ok) {
                  setJobData(jobData.job);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching job link:", err);
      } finally {
        setLoadingJobLink(false);
      }
    };
    
    fetchJobLink();
  }, [estimateId]);

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

  // Extract estimate data (safe even if estimate is null) - MUST be before any usage
  const contact = estimate?.contact || {};
  const items = isEditMode ? editedItems : (estimate?.items || []);
  const portalMeta = estimate?.portalMeta || {};
  const linkedInvoice = estimate?.linkedInvoice;
  const currency = estimate?.currency || DEFAULT_CURRENCY;

  // Memoize getStatusDisplay function
  const getStatusDisplay = useCallback((displayStatus) => {
    switch (displayStatus) {
      case 'ACCEPTED':
      case 'INVOICE_READY':
        return { variant: 'success', label: 'Accepted' };
      case 'REJECTED':
        return { variant: 'destructive', label: 'Rejected' };
      case 'PHOTOS_UNDER_REVIEW':
        return { variant: 'info', label: 'Under Review' };
      case 'READY_TO_ACCEPT':
        return { variant: 'success', label: 'Ready to Accept' };
      case 'CHANGES_REQUESTED':
        return { variant: 'warning', label: 'Changes Requested' };
      case 'AWAITING_PHOTOS':
      case 'PHOTOS_UPLOADED':
        return { variant: 'info', label: 'Awaiting Photos' };
      case 'ESTIMATE_SENT':
      default:
        return { variant: 'warning', label: 'Sent' };
    }
  }, []);

  // Compute UI state from portal meta to get accurate status
  const uiState = useMemo(() => computeUIState(portalMeta), [portalMeta]);
  const displayStatus = uiState.displayStatus;
  const statusMessage = uiState.statusMessage;
  const statusDisplay = useMemo(() => getStatusDisplay(displayStatus), [displayStatus, getStatusDisplay]);

  // Memoize date formatting with validation
  const acceptedAtFormatted = useMemo(() => {
    if (!portalMeta.acceptedAt) return null;
    const date = new Date(portalMeta.acceptedAt);
    if (isNaN(date.getTime())) return null; // Invalid date
    return date.toLocaleString();
  }, [portalMeta.acceptedAt]);

  const submittedAtFormatted = useMemo(() => {
    if (!portalMeta.photos?.submitted_at) return null;
    const date = new Date(portalMeta.photos.submitted_at);
    if (isNaN(date.getTime())) return null; // Invalid date
    return date.toLocaleString();
  }, [portalMeta.photos?.submitted_at]);

  // Memoize estimateTotal for DiscountModal
  const estimateTotalForDiscount = useMemo(() => {
    return (editedItems || [])
      .filter(item => item != null)
      .reduce((sum, item) => {
        const amount = Number(item?.amount);
        const qty = Number(item?.qty || item?.quantity || 1);
        return sum + ((isNaN(amount) ? 0 : amount) * (isNaN(qty) ? 1 : qty));
      }, 0);
  }, [editedItems]);

  // Calculate totals (safe even if estimate is null) - MUST be before handleConfirmSave
  const originalTotal = estimate?.total || 0;
  const newTotal = useMemo(() => {
    const itemsTotal = (editedItems || [])
      .filter(item => item != null)
      .reduce((sum, item) => {
        const amount = Number(item?.amount);
        const qty = Number(item?.qty || item?.quantity || 1);
        return sum + ((isNaN(amount) ? 0 : amount) * (isNaN(qty) ? 1 : qty));
      }, 0);
    
    if (editedDiscount && editedDiscount.value !== 0 && editedDiscount.type) {
      const discountValue = Number(editedDiscount.value);
      if (isNaN(discountValue)) return itemsTotal;
      
      if (editedDiscount.type === 'percentage') {
        // For percentage: positive = discount, negative = surcharge
        return itemsTotal * (1 - discountValue / 100);
      } else {
        // For fixed: positive = discount, negative = surcharge
        return itemsTotal - discountValue;
      }
    }
    
    return itemsTotal;
  }, [editedItems, editedDiscount]);

  // Detect changes - MUST be before handleConfirmSave
  const changedItems = useMemo(() => {
    if (!isEditMode) return [];
    const original = estimate?.items || [];
    return (editedItems || [])
      .filter(item => item != null)
      .filter((edited, idx) => {
        const orig = original[idx];
        return orig && (edited?.qty || edited?.quantity) !== (orig?.qty || orig?.quantity);
      })
      .map((edited) => ({
        name: edited?.name || 'Item',
        originalQty: edited?.originalQty || 0,
        newQty: edited?.qty || edited?.quantity || 0
      }));
  }, [isEditMode, editedItems, estimate]);

  const addedItems = useMemo(() => {
    if (!isEditMode) return [];
    const originalCount = estimate?.items?.length || 0;
    return (editedItems || []).slice(originalCount).filter(item => item != null);
  }, [isEditMode, editedItems, estimate]);

  // Initialize edited items when entering edit mode
  const handleEnterEditMode = useCallback(() => {
    const items = estimate?.items || [];
    setEditedItems(items.filter(item => item != null).map(item => ({ 
      ...item, 
      originalQty: item?.qty || item?.quantity || 1 
    })));
    setEditedDiscount(estimate?.discount || null);
    setRemovedItems([]);
    setIsEditMode(true);
  }, [estimate?.items, estimate?.discount]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditedItems([]);
    setEditedDiscount(null);
    setRemovedItems([]);
  }, []);

  const handleSaveClick = useCallback(() => {
    // Validation
    if (editedItems.length === 0) {
      toast.error("Cannot save estimate with no items");
      return;
    }
    
    const invalidItems = (editedItems || []).filter(item => {
      if (!item) return true; // Filter out null items
      const qty = Number(item?.qty || item?.quantity || 0);
      const amount = Number(item?.amount || 0);
      return isNaN(amount) || isNaN(qty) || amount <= 0 || qty <= 0;
    });
    
    if (invalidItems.length > 0) {
      toast.error("All items must have positive price and quantity");
      return;
    }
    
    // Show save confirmation modal
    setShowSaveModal(true);
  }, [editedItems]);

  // Define handleSendEstimate before handleConfirmSave since it's used in handleConfirmSave's dependency array
  const handleSendEstimate = useCallback(async () => {
    // Prevent double-clicking or concurrent sends
    if (sendEstimateMutation.isPending) {
      return;
    }
    
    try {
      await sendEstimateMutation.mutateAsync({ estimateId, locationId });
      // Note: Toast is handled in the mutation hook's onSuccess handler
      // No refetch needed - mutation already invalidates queries
    } catch (err) {
      // Log error for debugging (toast is handled by hook's onError handler)
      console.error('Send estimate error:', err);
      // Prevent error from bubbling up to Next.js error boundary
      return;
    }
  }, [sendEstimateMutation, estimateId, locationId]);

  const handleConfirmSave = useCallback(async ({ adminNote, sendNotification }) => {
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
        changedItems: (changedItems || []).filter(item => item != null).map(item => ({
          name: item?.name || 'Item',
          oldQty: item?.originalQty || 0,
          newQty: item?.newQty || 0
        })),
        addedItems: (addedItems || []).filter(item => item != null).map(item => ({
          name: item?.name || 'Item',
          qty: item?.qty || 1,
          amount: item?.amount || 0
        })),
        removedItems: (removedItems || []).filter(item => item != null).map(item => ({
          name: item?.name || 'Item',
          qty: item?.qty || item?.quantity || 1,
          amount: item?.amount || 0
        })),
        discount: editedDiscount
      };

      // 1. Update estimate (one API call)
      await updateEstimateMutation.mutateAsync({
        estimateId,
        locationId,
        items: (editedItems || []).filter(item => item != null).map(item => ({
          name: item?.name || 'Item',
          description: item?.description || '',
          currency: item?.currency || estimate?.currency || DEFAULT_CURRENCY,
          amount: item?.amount || 0,
          qty: item?.qty || item?.quantity || 1
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
          const errorMessage = parseWpFetchError(err);
          // Make it clear the estimate was saved but notification failed
          toast.error(errorMessage || "Estimate saved but failed to notify customer", {
            duration: 6000, // Longer duration for important error
          });
        }
      } else if (displayStatus !== 'ACCEPTED' && displayStatus !== 'REJECTED' && displayStatus !== 'INVOICE_READY') {
        // Remind admin to send estimate if customer hasn't accepted yet
        toast.info("Don't forget to send the updated estimate to the customer!", {
          duration: 5000,
          action: {
            label: 'Send Now',
            onClick: () => handleSendEstimate()
          }
        });
      }
      
      // Note: No refetch needed - mutations already invalidate queries and React Query will refetch automatically
    } catch (err) {
      const errorMessage = parseWpFetchError(err);
      toast.error(errorMessage || "Failed to update estimate");
      // Note: No refetch needed - React Query will refetch on next mount or when queries are refocused
    }
  }, [originalTotal, newTotal, changedItems, addedItems, removedItems, editedDiscount, editedItems, estimate, updateEstimateMutation, estimateId, locationId, sendRevisionMutation, displayStatus, handleSendEstimate]);

  const handleQuantityChange = useCallback((index, delta) => {
    setEditedItems(prev => {
      // Bounds check: ensure index is valid
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      
      const newItems = [...prev];
      if (!newItems[index]) return prev; // Safety check
      const currentQty = newItems[index]?.qty || newItems[index]?.quantity || 1;
      const originalQty = newItems[index]?.originalQty || currentQty;
      
      // Calculate min/max based on original quantity
      const minQty = Math.max(1, originalQty - 10);
      const maxQty = originalQty + 10;
      
      // Apply delta and constrain to limits
      const newQty = Math.max(minQty, Math.min(currentQty + delta, maxQty));
      
      newItems[index] = { ...newItems[index], qty: newQty, quantity: newQty };
      return newItems;
    });
  }, []);

  const handleRemoveItemClick = useCallback((index) => {
    // Bounds check: ensure index is valid
    setEditedItems(prev => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      setItemToDeleteIndex(index);
      setDeleteItemDialogOpen(true);
      return prev;
    });
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setEditedItems(prev => {
      if (index < 0 || index >= prev.length) return prev; // Safety check
      const item = prev[index];
      // Track removed items if they were original (not custom added)
      if (item && !item.isCustom) {
        setRemovedItems(prevRemoved => [...prevRemoved, item]);
      }
      setDeleteItemDialogOpen(false);
      setItemToDeleteIndex(null);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleAddCustomItem = useCallback((newItem) => {
    setEditedItems(prev => [...prev, newItem]);
  }, []);

  const handleApplyDiscount = useCallback((discount) => {
    setEditedDiscount(discount);
  }, []);

  const handleRowSelect = useCallback((item) => {
    if (!isEditMode) {
      if (selectedItem?.name === item?.name) {
        setSelectedItem(null);
      } else {
        setSelectedItem(item);
      }
    }
  }, [isEditMode, selectedItem]);

  // Memoize modal handlers to prevent unnecessary re-renders
  const handleShowAddItemModal = useCallback(() => {
    setShowAddItemModal(true);
  }, []);

  const handleShowDiscountModal = useCallback(() => {
    setShowDiscountModal(true);
  }, []);

  // Memoize filtered items array to prevent re-filtering on every render
  const filteredItems = useMemo(() => {
    return (items || []).filter(item => item != null);
  }, [items]);

  // Memoize created date formatting
  const createdAtFormatted = useMemo(() => {
    if (!estimate?.createdAt) return "N/A";
    const date = new Date(estimate.createdAt);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  }, [estimate?.createdAt]);

  // Memoize status icon component logic
  const statusIcon = useMemo(() => {
    switch (displayStatus) {
      case 'ESTIMATE_SENT':
        return <Send className="h-3 w-3" />;
      case 'ACCEPTED':
      case 'INVOICE_READY':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'REJECTED':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return null;
    }
  }, [displayStatus]);

  const statusIconLarge = useMemo(() => {
    switch (displayStatus) {
      case 'ESTIMATE_SENT':
        return <Send className="h-4 w-4 text-warning" />;
      case 'ACCEPTED':
      case 'INVOICE_READY':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'REJECTED':
        return <CheckCircle2 className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  }, [displayStatus]);

  const handleCreateInvoice = useCallback(async () => {
    try {
      const result = await createInvoiceMutation.mutateAsync({ estimateId, locationId });
      toast.success("Invoice created successfully");
      // Note: No refetch needed - mutation already invalidates queries
      if (onInvoiceCreated) {
        onInvoiceCreated(result);
      }
    } catch (err) {
      const errorMessage = parseWpFetchError(err);
      toast.error(errorMessage || "Failed to create invoice");
    }
  }, [createInvoiceMutation, estimateId, locationId, onInvoiceCreated]);

  const handleCreateServiceM8Job = useCallback(async () => {
    if (!estimateId) {
      toast.error("Estimate ID is required");
      return;
    }
    
    // Try to get locationId from multiple sources, but let backend resolve if missing
    const effectiveLocationId = locationId || estimate?.locationId || estimate?.altId || estimate?.location_id || null;
    
    setCreatingJob(true);
    try {
      const res = await fetch("/api/servicem8/jobs/create-from-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId,
          ...(effectiveLocationId ? { locationId: effectiveLocationId } : {}),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create ServiceM8 job");
      }
      
      toast.success(data.alreadyExists ? "Job already exists" : "ServiceM8 job created successfully");
      
      // Refresh job link and data
      if (data.jobUuid) {
        const linkRes = await fetch(`/api/servicem8/jobs/link?estimateId=${encodeURIComponent(estimateId)}`);
        if (linkRes.ok) {
          const linkData = await linkRes.json();
          if (linkData.ok && linkData.link) {
            setJobLink(linkData.link);
            
            const jobRes = await fetch(`/api/servicem8/jobs/${data.jobUuid}`);
            if (jobRes.ok) {
              const jobData = await jobRes.json();
              if (jobData.ok) {
                setJobData(jobData.job);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error creating ServiceM8 job:", err);
      toast.error(err.message || "Failed to create ServiceM8 job");
    } finally {
      setCreatingJob(false);
    }
  }, [estimateId, locationId, estimate?.locationId, estimate?.altId, estimate?.location_id]);

  const handleCompleteReview = useCallback(async () => {
    try {
      await completeReviewMutation.mutateAsync({ estimateId, locationId });
      // Note: Toast is handled in the mutation hook's onSuccess handler
      // No refetch needed - mutation already invalidates queries
    } catch (err) {
      const errorMessage = parseWpFetchError(err);
      toast.error(errorMessage || "Failed to complete review");
    }
  }, [completeReviewMutation, estimateId, locationId]);

  const handleRequestChanges = useCallback(async (reason = '') => {
    try {
      await requestChangesMutation.mutateAsync({ estimateId, locationId, reason });
      toast.success("Changes requested. Customer can now resubmit photos.");
      // Note: No refetch needed - mutation already invalidates queries
    } catch (err) {
      const errorMessage = parseWpFetchError(err);
      toast.error(errorMessage || "Failed to request changes");
    }
  }, [requestChangesMutation, estimateId, locationId]);

  const handleViewServiceM8Job = useCallback(async () => {
    const jobUuid = jobLink?.jobUuid || jobData?.uuid;
    if (!jobUuid) {
      toast.error("Job UUID not found");
      return;
    }
    
    // Fetch latest job data if not already loaded or if different UUID
    if (!jobData || jobData.uuid !== jobUuid) {
      try {
        const jobRes = await fetch(`/api/servicem8/jobs/${jobUuid}`);
        if (jobRes.ok) {
          const jobDataRes = await jobRes.json();
          if (jobDataRes.ok) {
            setJobData(jobDataRes.job);
          }
        }
      } catch (err) {
        console.error("Error fetching job data:", err);
        toast.error("Failed to load job details");
        return;
      }
    }
    
    setJobModalOpen(true);
  }, [jobLink?.jobUuid, jobData]);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card p-8 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{estimate?.title || "ESTIMATE"}</h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Estimate #{estimate?.estimateNumber || estimateId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {portalMeta.quote?.revisionNumber != null && portalMeta.quote.revisionNumber > 0 && (
              <Badge variant="outline" className="text-xs font-semibold shadow-sm px-3 py-1">
                Revision {portalMeta.quote.revisionNumber}
              </Badge>
            )}
            {portalMeta.workflow?.status === 'ready_to_accept' && portalMeta.quote?.acceptance_enabled && (
              <Badge variant="info" className="text-xs font-semibold shadow-sm px-3 py-1">
                Awaiting Acceptance
              </Badge>
            )}
            <Badge
              variant={statusDisplay.variant}
              className="text-xs font-semibold shadow-sm px-3 py-1 flex items-center gap-1.5"
            >
              {statusIcon}
              {statusDisplay.label}
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Customer</p>
            </div>
            <p className="mt-2 font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {contact.name || "N/A"}
            </p>
            {contact.email && (
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {contact.email}
              </p>
            )}
            {contact.phone && (
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                {contact.phone}
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</p>
            </div>
            <p className="mt-2 font-semibold text-foreground flex items-center gap-2">
              {statusIconLarge}
              {statusDisplay.label}
            </p>
            {portalMeta.quote?.revisionNumber != null && portalMeta.quote.revisionNumber > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Revision {portalMeta.quote.revisionNumber}
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Estimate Total</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {currency} {(isEditMode ? newTotal : originalTotal).toFixed(2)}
            </p>
            {portalMeta.photos?.submission_status === 'submitted' && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {portalMeta.photos.total || 0} photo{(portalMeta.photos.total || 0) !== 1 ? 's' : ''} submitted
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Created</p>
            </div>
            <p className="mt-2 font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {createdAtFormatted}
            </p>
            {acceptedAtFormatted && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
                Accepted: {acceptedAtFormatted}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Items (Left 70%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Edit Mode Controls */}
          {!isEditMode && !hasInvoice && (displayStatus !== 'ACCEPTED' && displayStatus !== 'REJECTED' && displayStatus !== 'INVOICE_READY' || portalMeta.photos?.submission_status === 'submitted') && (
            <div className="rounded-xl border border-info/30 bg-info-bg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-info">Ready for Review</p>
                    <p className="text-sm text-info">
                      {displayStatus === 'ACCEPTED' || displayStatus === 'INVOICE_READY'
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
          <div className="rounded-xl border border-border/60 bg-card p-7 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
              {isEditMode && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleShowAddItemModal}
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
                    onClick={handleShowDiscountModal}
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
            
            {filteredItems.length === 0 ? (
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
                    {filteredItems.map((item, idx) => {
                      const itemName = item?.name || "Item";
                      const photoCount = itemPhotoCounts[itemName] || 0;
                      const itemQty = item?.qty || item?.quantity || 1;
                      const isSelected = !isEditMode && selectedItem?.name === itemName;
                      
                      return (
                        <EstimateTableRow
                          key={item?.id || idx}
                          item={item}
                          idx={idx}
                          photoCount={photoCount}
                          isSelected={isSelected}
                          currency={currency}
                          isEditMode={isEditMode}
                          itemQty={itemQty}
                          onQuantityChange={handleQuantityChange}
                          onRemoveClick={handleRemoveItemClick}
                          onSelect={handleRowSelect}
                        />
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
                <span className="font-medium text-foreground">{statusDisplay.label}</span>
              </div>
              {acceptedAtFormatted && (
                <div>
                  <span className="text-muted-foreground">Accepted:</span>{" "}
                  <span className="font-medium text-foreground">
                    {acceptedAtFormatted}
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
              {submittedAtFormatted && (
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="font-medium text-foreground">
                    {submittedAtFormatted}
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
                  <span className="font-medium text-foreground">{linkedInvoice?.number || linkedInvoice?.invoiceNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge
                    variant={
                      linkedInvoice?.status === "paid" ? "success" :
                      linkedInvoice?.status === "draft" ? "default" :
                      "warning"
                    }
                    className="text-xs font-medium"
                  >
                    {linkedInvoice?.status || "draft"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Due:</span>{" "}
                  <span className="font-medium text-foreground">
                    {currency} {((linkedInvoice?.amountDue ?? 0) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Linked ServiceM8 Job */}
          {loadingJobLink ? (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">ServiceM8 Job</h3>
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : jobLink && jobData ? (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Linked ServiceM8 Job</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Job Number:</span>{" "}
                  <span className="font-medium text-foreground">{jobData?.job_number || jobData?.jobNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${
                      jobData?.status === "Completed" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                      jobData?.status === "In Progress" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      jobData?.status === "Scheduled" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}
                  >
                    {jobData?.status || jobData?.job_status || "Unknown"}
                  </Badge>
                </div>
                {jobData?.assigned_to_staff_name && (
                  <div>
                    <span className="text-muted-foreground">Assigned To:</span>{" "}
                    <span className="font-medium text-foreground">{jobData.assigned_to_staff_name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
            <div className="space-y-2">
              {estimate?.id && (
                <a
                  href={`https://app.gohighlevel.com/v2/location/${locationId || estimate?.locationId}/estimates/${estimate?.id}`}
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
              {/* Single Admin Button - "Send Estimate" or "Finish" */}
              {portalMeta && (() => {
                const uiState = computeUIState(portalMeta);
                const showFinish = uiState.adminCanFinish;
                const showSend = uiState.adminCanSendEstimate;
                
                // Don't show button if neither state is active
                if (!showFinish && !showSend) {
                  return null;
                }
                
                return (
                  <>
                    {/* Single button: "Send Estimate" or "Finish" */}
                    <button
                      onClick={showFinish ? handleCompleteReview : handleSendEstimate}
                      disabled={showFinish ? completeReviewMutation.isPending : sendEstimateMutation.isPending}
                      className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: 'hsl(280, 45%, 50%)',
                        // Matte texture: no shadows, flat appearance
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = 'hsl(280, 45%, 47%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'hsl(280, 45%, 50%)';
                      }}
                    >
                      {showFinish ? (
                        completeReviewMutation.isPending ? (
                          <>
                            <Spinner size="sm" />
                            Finishing...
                          </>
                        ) : (
                          "Finish"
                        )
                      ) : (
                        sendEstimateMutation.isPending ? (
                          "Sending..."
                        ) : (
                          "Send Estimate"
                        )
                      )}
                    </button>
                    
                    {/* Request Changes - Secondary action (only when photos required) */}
                    {uiState.adminCanRequestChanges && (
                      <Button
                        onClick={() => handleRequestChanges()}
                        disabled={requestChangesMutation.isPending}
                        variant="outline"
                        className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
                      >
                        {requestChangesMutation.isPending ? (
                          <>
                            <Spinner size="sm" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Request Changes / More Photos
                          </>
                        )}
                      </Button>
                    )}
                  </>
                );
              })()}
              {!hasInvoice && (displayStatus === 'ACCEPTED' || displayStatus === 'INVOICE_READY') && (
                <Button
                  onClick={handleCreateInvoice}
                  disabled={createInvoiceMutation.isPending}
                  variant="default"
                  className="w-full"
                >
                  {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              )}
              
              {/* ServiceM8 Actions */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                {!jobLink ? (
                  <Button
                    onClick={handleCreateServiceM8Job}
                    disabled={creatingJob || !estimateId || isLoading || !estimate}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
                  >
                    {creatingJob ? (
                      <>
                        <Spinner size="sm" />
                        Creating Job...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create ServiceM8 Job
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleViewServiceM8Job}
                    disabled={!jobLink?.jobUuid}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View/Manage ServiceM8 Job
                  </Button>
                )}
              </div>
              <div className="pt-2 border-t border-border/60">
                <Button
                  onClick={() => setDeleteEstimateDialogOpen(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Estimate
                </Button>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <PhotoGallery
            estimateId={estimateId}
            items={estimate?.items || []}
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
        estimateTotal={estimateTotalForDiscount}
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

      {/* Delete Estimate Dialog */}
      <DeleteDialog
        open={deleteEstimateDialogOpen}
        onOpenChange={setDeleteEstimateDialogOpen}
        onConfirm={async () => {
          try {
            await deleteEstimateMutation.mutateAsync({
              estimateId,
              locationId: locationId || estimate?.locationId,
              scope: deleteScope,
            });
          } catch (err) {
            // Error already handled in mutation
          }
        }}
        title="Delete Estimate"
        description={`Are you sure you want to delete estimate #${estimate?.estimateNumber || estimateId}? This action cannot be undone.`}
        itemName={`estimate #${estimate?.estimateNumber || estimateId}`}
        isLoading={deleteEstimateMutation.isPending}
        showScopeSelection={true}
        scope={deleteScope}
        onScopeChange={setDeleteScope}
      />

      {/* ServiceM8 Job Detail Modal */}
      {jobData && (
        <JobDetailModal
          job={jobData}
          open={jobModalOpen}
          onClose={() => {
            setJobModalOpen(false);
            // Optionally refresh job data when closing
            if (jobLink?.jobUuid) {
              fetch(`/api/servicem8/jobs/${jobLink.jobUuid}`)
                .then(res => res.json())
                .then(data => {
                  if (data.ok) {
                    setJobData(data.job);
                  }
                })
                .catch(err => console.error("Error refreshing job:", err));
            }
          }}
        />
      )}
    </div>
  );
});
EstimateDetailContent.displayName = 'EstimateDetailContent';

