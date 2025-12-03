import { useMutation, useQueryClient } from '@tanstack/react-query';

const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:8882/wp-json';

/**
 * React Query hook for updating estimate items/prices
 * Used in admin photo review panel for quick adjustments
 */
export function useUpdateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ estimateId, locationId, items, discount, termsNotes }) => {
      // First, fetch current estimate to get all required fields for GHL
      const getRes = await fetch(
        `${WP_API_BASE}/ca/v1/admin/estimates/${estimateId}${locationId ? `?locationId=${locationId}` : ''}`,
        { credentials: 'include' }
      );

      if (!getRes.ok) {
        const error = await getRes.json().catch(() => ({}));
        throw new Error(error.err || error.error || 'Failed to fetch current estimate');
      }

      const currentData = await getRes.json();
      
      if (!currentData.ok) {
        throw new Error('Invalid estimate data');
      }

      const current = currentData;

      // Build compliant update payload
      const currency = current.currency || 'AUD';
      const name40 = (current.title || 'Estimate').substring(0, 40);
      const title = current.title || 'ESTIMATE';
      
      const businessDetails = current.businessDetails || [{ name: 'Cheap Alarms' }];
      const contactDetails = {
        name: current.contact?.name || '',
        email: current.contact?.email || '',
        phoneNo: current.contact?.phone || ''
      };

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

      const payload = {
        estimateId,
        altId: locationId || current.locationId,
        altType: 'location',
        name: name40,
        title,
        businessDetails,
        currency,
        discount: discountData,
        contactDetails,
        issueDate,
        expiryDate,
        frequencySettings: current.frequencySettings || { enabled: false },
        liveMode: current.liveMode !== undefined ? current.liveMode : true,
        items: formattedItems,
        termsNotes: termsNotes !== undefined ? termsNotes : (current.termsNotes || '')
      };

      // PUT to WordPress bridge (which updates GHL)
      const updateRes = await fetch(`${WP_API_BASE}/ca/v1/estimate/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) {
        const error = await updateRes.json().catch(() => ({}));
        throw new Error(error.err || error.error || 'Failed to update estimate');
      }

      return updateRes.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch estimate data
      queryClient.invalidateQueries({ queryKey: ['admin-estimate', variables.estimateId] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimates'] });
    },
  });
}

