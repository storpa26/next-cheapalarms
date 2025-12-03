import { useState } from 'react';
import { Modal } from './Modal';

/**
 * Modal for applying discounts or surcharges to estimate
 * Used for photo-based price adjustments
 */
export function DiscountModal({ isOpen, onClose, onApply, currentDiscount, estimateTotal, currency = 'AUD' }) {
  const [type, setType] = useState(currentDiscount?.type || 'percentage');
  const [value, setValue] = useState(currentDiscount?.value?.toString() || '');
  const [name, setName] = useState(currentDiscount?.name || '');
  const [isDiscount, setIsDiscount] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!value || parseFloat(value) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const numValue = parseFloat(value);
    
    // For surcharges, use negative value; for discounts, use positive value
    // This way the calculation logic can always subtract the value
    const discount = {
      type,
      value: isDiscount ? numValue : -numValue,
      name: name.trim() || (isDiscount ? 'Discount' : 'Surcharge'),
      isDiscount, // Track whether this is a discount or surcharge
    };

    onApply(discount);
    onClose();
  };

  const handleCancel = () => {
    // Reset to current discount if exists
    if (currentDiscount) {
      setType(currentDiscount.type);
      setValue(currentDiscount.value?.toString() || '');
      setName(currentDiscount.name || '');
    }
    onClose();
  };

  // Calculate preview amount
  const previewAmount = () => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'percentage') {
      return (estimateTotal * numValue) / 100;
    }
    return numValue;
  };

  const calculatedAmount = previewAmount();
  // Always subtract since surcharges will have negative value
  const newTotal = estimateTotal - (isDiscount ? calculatedAmount : -calculatedAmount);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Apply Adjustment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Discount or Surcharge */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsDiscount(true)}
              className={`flex-1 px-4 py-2 rounded-lg border transition ${
                isDiscount
                  ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Discount
            </button>
            <button
              type="button"
              onClick={() => setIsDiscount(false)}
              className={`flex-1 px-4 py-2 rounded-lg border transition ${
                !isDiscount
                  ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Surcharge
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isDiscount ? 'e.g., Easy install discount' : 'e.g., Difficult access fee'}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground"
          />
        </div>

        {/* Amount Type (Fixed or Percentage) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('fixed')}
              className={`flex-1 px-4 py-2 rounded-lg border transition ${
                type === 'fixed'
                  ? 'border-[#1EA6DF] bg-[#1EA6DF]/10 text-[#1EA6DF] font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Fixed ({currency})
            </button>
            <button
              type="button"
              onClick={() => setType('percentage')}
              className={`flex-1 px-4 py-2 rounded-lg border transition ${
                type === 'percentage'
                  ? 'border-[#1EA6DF] bg-[#1EA6DF]/10 text-[#1EA6DF] font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              Percentage (%)
            </button>
          </div>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {type === 'percentage' ? 'Percentage' : `Amount (${currency})`} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? '10' : '100.00'}
            min="0"
            step={type === 'percentage' ? '1' : '0.01'}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA6DF] bg-background text-foreground"
            required
          />
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Original Total:</span>
            <span className="font-medium text-foreground">{currency} {estimateTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={isDiscount ? 'text-green-600' : 'text-orange-600'}>
              {isDiscount ? 'Discount:' : 'Surcharge:'}
            </span>
            <span className={`font-medium ${isDiscount ? 'text-green-600' : 'text-orange-600'}`}>
              {isDiscount ? '-' : '+'}{currency} {calculatedAmount.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground">New Total:</span>
            <span className="text-lg font-bold text-foreground">
              {currency} {newTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition hover:shadow-lg ${
              isDiscount
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}
          >
            Apply {isDiscount ? 'Discount' : 'Surcharge'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

