import { DEFAULT_CURRENCY } from "@/lib/admin/constants";

/**
 * ChangeSummary - Displays before/after comparison when editing estimate
 * Shows original total, changes made, and new total
 */
export function ChangeSummary({ 
  originalTotal, 
  newTotal, 
  changedItems = [], 
  addedItems = [], 
  removedItems = [],
  discount,
  currency = DEFAULT_CURRENCY 
}) {
  const hasChanges = changedItems.length > 0 || addedItems.length > 0 || removedItems.length > 0 || discount;
  const difference = newTotal - originalTotal;
  const isIncrease = difference > 0;

  if (!hasChanges) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warning/50 bg-warning-bg/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-foreground">Changes Made</h3>
      </div>

      {/* Changed Quantities */}
      {changedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-warning uppercase tracking-wide">Quantity Changed:</p>
          {changedItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-foreground">{item?.name || 'Item'}:</span>
              <span className="text-warning">
                {item?.originalQty ?? 0} → {item?.newQty ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Added Items */}
      {addedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-success uppercase tracking-wide">Items Added:</p>
          {addedItems.map((item, idx) => {
            const qty = item?.qty || item?.quantity || 1;
            const amount = item?.amount || 0;
            return (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {item?.name || 'Item'} {qty > 1 && `(×${qty})`}
                </span>
                <span className="font-medium text-success">
                  +{currency} {(amount * qty).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Removed Items */}
      {removedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-error uppercase tracking-wide">Items Removed:</p>
          {removedItems.map((item, idx) => {
            const qty = item?.qty || item?.quantity || 1;
            const amount = item?.amount || 0;
            return (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-foreground line-through">{item?.name || 'Item'}</span>
                <span className="font-medium text-error">
                  -{currency} {(amount * qty).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Discount/Surcharge */}
      {discount && discount.value !== undefined && discount.value > 0 && discount?.type && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-info uppercase tracking-wide">Price Adjustment:</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              {discount?.name || 'Adjustment'}
              {discount?.type === 'percentage' && ` (${discount.value}%)`}
            </span>
            <span className="font-medium text-info">
              {discount?.type === 'fixed' ? `-${currency} ${discount.value.toFixed(2)}` : `-${discount.value}%`}
            </span>
          </div>
        </div>
      )}

      {/* Total Comparison */}
      <div className="border-t border-warning/50 pt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-warning">Original Total:</span>
          <span className="font-medium text-foreground">{currency} {originalTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">New Total:</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {currency} {newTotal.toFixed(2)}
            </span>
            {difference !== 0 && (
              <span className={`text-sm font-semibold ${isIncrease ? 'text-success' : 'text-error'}`}>
                ({isIncrease ? '+' : ''}{currency} {Math.abs(difference).toFixed(2)})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

