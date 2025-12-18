import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_CURRENCY } from '@/lib/admin/constants';
import { Modal } from './Modal';
import { toast } from 'sonner';

/**
 * Modal for applying discounts or surcharges to estimate
 * Used for photo-based price adjustments
 */
export function DiscountModal({ isOpen, onClose, onApply, currentDiscount, estimateTotal, currency = DEFAULT_CURRENCY }) {
  const [type, setType] = useState(currentDiscount?.type || 'percentage');
  const [value, setValue] = useState(currentDiscount?.value?.toString() || '');
  const [name, setName] = useState(currentDiscount?.name || '');
  const [isDiscount, setIsDiscount] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!value || parseFloat(value) <= 0) {
      toast.error('Please enter a valid amount');
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
            <Button
              type="button"
              onClick={() => setIsDiscount(true)}
              variant={isDiscount ? "default" : "outline"}
              className={`flex-1 ${isDiscount ? 'bg-success text-success-foreground border-success' : ''}`}
            >
              Discount
            </Button>
            <Button
              type="button"
              onClick={() => setIsDiscount(false)}
              variant={!isDiscount ? "default" : "outline"}
              className={`flex-1 ${!isDiscount ? 'bg-warning text-warning-foreground border-warning' : ''}`}
            >
              Surcharge
            </Button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isDiscount ? 'e.g., Easy install discount' : 'e.g., Difficult access fee'}
          />
        </div>

        {/* Amount Type (Fixed or Percentage) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount Type
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setType('fixed')}
              variant={type === 'fixed' ? "default" : "outline"}
              className="flex-1"
            >
              Fixed ({currency})
            </Button>
            <Button
              type="button"
              onClick={() => setType('percentage')}
              variant={type === 'percentage' ? "default" : "outline"}
              className="flex-1"
            >
              Percentage (%)
            </Button>
          </div>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {type === 'percentage' ? 'Percentage' : `Amount (${currency})`} <span className="text-error">*</span>
          </label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'percentage' ? '10' : '100.00'}
            min="0"
            step={type === 'percentage' ? '1' : '0.01'}
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
            <span className={isDiscount ? 'text-success' : 'text-warning'}>
              {isDiscount ? 'Discount:' : 'Surcharge:'}
            </span>
            <span className={`font-medium ${isDiscount ? 'text-success' : 'text-warning'}`}>
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
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            className={`flex-1 ${isDiscount ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-warning text-warning-foreground hover:bg-warning/90'}`}
          >
            Apply {isDiscount ? 'Discount' : 'Surcharge'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

