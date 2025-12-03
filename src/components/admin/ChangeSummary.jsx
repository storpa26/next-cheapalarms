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
  currency = 'AUD' 
}) {
  const hasChanges = changedItems.length > 0 || addedItems.length > 0 || removedItems.length > 0 || discount;
  const difference = newTotal - originalTotal;
  const isIncrease = difference > 0;

  if (!hasChanges) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-amber-900">Changes Made</h3>
      </div>

      {/* Changed Quantities */}
      {changedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Quantity Changed:</p>
          {changedItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-amber-900">{item.name}:</span>
              <span className="text-amber-600">
                {item.originalQty} → {item.newQty}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Added Items */}
      {addedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Items Added:</p>
          {addedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-green-900">
                {item.name} {item.qty > 1 && `(×${item.qty})`}
              </span>
              <span className="font-medium text-green-700">
                +{currency} {(item.amount * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Removed Items */}
      {removedItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Items Removed:</p>
          {removedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-red-900 line-through">{item.name}</span>
              <span className="font-medium text-red-700">
                -{currency} {(item.amount * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Discount/Surcharge */}
      {discount && discount.value > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Price Adjustment:</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-900">
              {discount.name || 'Adjustment'}
              {discount.type === 'percentage' && ` (${discount.value}%)`}
            </span>
            <span className="font-medium text-blue-700">
              {discount.type === 'fixed' ? `-${currency} ${discount.value.toFixed(2)}` : `-${discount.value}%`}
            </span>
          </div>
        </div>
      )}

      {/* Total Comparison */}
      <div className="border-t border-amber-200 pt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-amber-700">Original Total:</span>
          <span className="font-medium text-amber-900">{currency} {originalTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-amber-900">New Total:</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-amber-900">
              {currency} {newTotal.toFixed(2)}
            </span>
            {difference !== 0 && (
              <span className={`text-sm font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                ({isIncrease ? '+' : ''}{currency} {Math.abs(difference).toFixed(2)})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

