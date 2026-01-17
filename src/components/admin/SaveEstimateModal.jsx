import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { DEFAULT_CURRENCY } from '../../lib/admin/constants';
import { Modal } from './Modal';

/**
 * Modal shown before saving estimate changes
 * Allows admin to add note for customer and choose whether to notify
 */
export function SaveEstimateModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  changedItems = [],
  addedItems = [],
  removedItems = [],
  discount,
  originalTotal,
  newTotal,
  currency = DEFAULT_CURRENCY,
  isSaving = false
}) {
  const [adminNote, setAdminNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  const difference = newTotal - originalTotal;
  const isDecrease = difference < 0;
  const hasChanges = changedItems.length > 0 || addedItems.length > 0 || removedItems.length > 0 || discount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ adminNote: adminNote.trim(), sendNotification });
  };

  const handleCancel = () => {
    setAdminNote('');
    setSendNotification(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Save Estimate Changes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Changes Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-2">Changes you&apos;re about to save:</p>
          
          {/* Quantity Changes */}
          {changedItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Quantities Adjusted:</p>
              {changedItems.map((item, idx) => (
                <div key={idx} className="text-sm text-foreground flex items-center gap-2">
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>{item.name}: {item.originalQty} → {item.newQty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Added Items */}
          {addedItems.length > 0 && (
            <div className="space-y-1 mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Items Added:</p>
              {addedItems.map((item, idx) => (
                <div key={idx} className="text-sm text-success flex items-center gap-2">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span>{item.name} (+{currency} {(item.amount * item.qty).toFixed(2)})</span>
                </div>
              ))}
            </div>
          )}

          {/* Removed Items */}
          {removedItems.length > 0 && (
            <div className="space-y-1 mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Items Removed:</p>
              {removedItems.map((item, idx) => (
                <div key={idx} className="text-sm text-error flex items-center gap-2">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="line-through">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Discount */}
          {discount && discount.value !== 0 && (
            <div className="space-y-1 mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Price Adjustment:</p>
              <div className="text-sm text-info flex items-center gap-2">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <span>{discount.name || 'Adjustment'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Impact */}
        <div className={`rounded-lg p-4 ${isDecrease ? 'bg-success-bg border border-success/30' : 'bg-info-bg border border-info/30'}`}>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Original Total:</span>
              <span className="font-medium text-foreground">{currency} {originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">New Total:</span>
              <span className="text-xl font-bold text-foreground">
                {currency} {newTotal.toFixed(2)}
              </span>
            </div>
            {difference !== 0 && (
              <div className={`flex justify-between items-center pt-2 border-t ${isDecrease ? 'border-success/30' : 'border-info/30'}`}>
                <span className={`font-semibold ${isDecrease ? 'text-success' : 'text-info'}`}>
                  {isDecrease ? '💚 Customer Saves:' : 'Additional Cost:'}
                </span>
                <span className={`text-lg font-bold ${isDecrease ? 'text-success' : 'text-info'}`}>
                  {isDecrease ? '-' : '+'}{currency} {Math.abs(difference).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Note */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Note for Customer <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={isDecrease 
              ? "e.g., Your site is easier to install than expected, so we applied a discount!"
              : "e.g., Based on your photos, we noticed a few extra items needed for proper coverage."
            }
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be included in the email and shown in the customer&apos;s portal
          </p>
        </div>

        {/* Send Notification Checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="sendNotification"
            checked={sendNotification}
            onCheckedChange={(checked) => setSendNotification(checked)}
            className="mt-1"
          />
          <label htmlFor="sendNotification" className="text-sm">
            <span className="font-medium text-foreground">Send email notification to customer</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recommended: Let customer know estimate was updated based on photos
            </p>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            variant="gradient"
            className="flex-1"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                {sendNotification ? 'Save & Notify Customer' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

