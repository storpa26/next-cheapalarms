import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wpFetch } from '@/lib/wp';

/**
 * React Query hook for updating estimate items/prices
 * Used in admin photo review panel for quick adjustments
 */
export function useUpdateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, items, discount, termsNotes, revisionData }) => {
      // First, fetch current estimate to get all required fields for GHL
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);
      const search = params.toString();
      
      const currentData = await wpFetch(`/ca/v1/admin/estimates/${estimateId}${search ? `?${search}` : ''}`);
      
      if (!currentData.ok) {
        throw new Error('Invalid estimate data');
      }

      const current = currentData;

      // Build compliant update payload
      const currency = current.currency || 'AUD';
      const name40 = (current.title || 'Estimate').substring(0, 40);
      const title = current.title || 'ESTIMATE';
      
      const businessDetails = current.businessDetails || [{ name: 'Cheap Alarms' }];
      
      // Build contactDetails with required ID field (GHL requirement)
      const contactDetails = {
        id: current.contact?.id || '', // Required by GHL - must be a non-empty string
        name: current.contact?.name || '',
        email: current.contact?.email || '',
        phoneNo: current.contact?.phone || ''
      };
      
      // Validate contact ID is present
      if (!contactDetails.id) {
        throw new Error('Contact ID is required to update estimate. Estimate must have a linked contact.');
      }

      // Format dates
      const formatDate = (dateValue) => {
        if (!dateValue) return new Date().toISOString().split('T')[0];
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
      };

      const issueDate = formatDate(current.issueDate);
      const expiryDate = formatDate(current.expiryDate || Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Format items
      const formattedItems = items.map((item) => ({
        name: item.name || '',
        description: item.description || '',
        currency: item.currency || currency,
        amount: parseFloat(item.amount) || 0,
        qty: parseInt(item.qty || item.quantity || 1, 10)
      }));

      // Prepare discount (use provided or existing)
      const discountData = discount !== undefined 
        ? discount 
        : (current.discount || { type: 'percentage', value: 0 });
      
      // Clean discount object - GHL only accepts 'type' and 'value' properties
      // Remove any extra properties like 'name' or 'isDiscount' that come from DiscountModal
      const cleanDiscount = {
        type: discountData.type || 'percentage',
        value: parseFloat(discountData.value) || 0
      };

      const payload = {
        estimateId,
        altId: locationId || current.locationId, // Backend extracts this and passes as query param, then removes from body
        altType: 'location',
        name: name40,
        title,
        businessDetails,
        currency,
        discount: cleanDiscount, // Use cleaned discount (only type and value)
        contactDetails,
        issueDate,
        expiryDate,
        frequencySettings: current.frequencySettings || { enabled: false },
        liveMode: current.liveMode !== undefined ? current.liveMode : true,
        items: formattedItems,
        termsNotes: termsNotes !== undefined ? termsNotes : (current.termsNotes || '')
      };

      // Include revision data if provided (for tracking estimate changes)
      if (revisionData) {
        payload.revisionData = revisionData;
      }

      // PUT to WordPress bridge (which updates GHL)
      return wpFetch('/ca/v1/estimate/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch estimate data
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    },
  });
}

