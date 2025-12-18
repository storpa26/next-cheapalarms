import { useState } from 'react';
import { Sparkles, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CURRENCY } from '@/lib/admin/constants';

/**
 * Banner shown in customer portal when estimate has been revised
 * Highlights savings or changes with compelling visuals
 */
export function RevisionBanner({ revision, currency = DEFAULT_CURRENCY, portalStatus }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!revision || !revision.revisedAt) return null;

  const netChange = revision.netChange || 0;
  const isSavings = netChange < 0;
  const isIncrease = netChange > 0;
  const hasDiscount = revision.discount && revision.discount.value !== 0;

  // Don't show if already accepted (too late to influence decision)
  if (portalStatus === 'accepted') return null;

  return (
    <>
      {/* Hero Banner */}
      <div className={`rounded-xl p-6 shadow-lg border-2 ${
        isSavings 
          ? 'bg-gradient-to-br from-success-bg via-success-bg/50 to-success-bg border-success/30'
          : 'bg-gradient-to-br from-info-bg via-info-bg/50 to-info-bg border-info/30'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {isSavings ? (
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-success-foreground" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-info flex items-center justify-center">
              <Info className="w-6 h-6 text-info-foreground" />
            </div>
          )}
          <div>
            <h2 className={`text-2xl font-bold ${isSavings ? 'text-success' : 'text-info'}`}>
              {isSavings ? '🎉 Great News - Your Estimate Has Been Updated!' : '📋 Your Estimate Has Been Updated'}
            </h2>
            <p className={`text-sm ${isSavings ? 'text-success' : 'text-info'}`}>
              Updated {new Date(revision.revisedAt).toLocaleDateString()} after reviewing your photos
            </p>
          </div>
        </div>

        {/* Pricing Impact */}
        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Original Price */}
          <div className="bg-surface/70 rounded-xl p-4 border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Original Estimate</p>
            <p className="text-2xl font-semibold text-muted-foreground line-through">
              {currency} {(revision.oldTotal || 0).toFixed(2)}
            </p>
          </div>

          {/* New Price */}
          <div className={`rounded-xl p-4 border-2 ${
            isSavings 
              ? 'bg-gradient-to-br from-success to-success/80 border-success/50' 
              : 'bg-gradient-to-br from-info to-info/80 border-info/50'
          }`}>
            <p className="text-xs uppercase tracking-wide text-white/80 mb-2">Your New Price</p>
            <p className="text-3xl font-bold text-white">
              {currency} {(revision.newTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Savings/Change Highlight */}
        {netChange !== 0 && (
          <div className={`rounded-xl p-4 text-center ${
            isSavings 
              ? 'bg-gradient-to-r from-success to-success/90'
              : 'bg-gradient-to-r from-info to-info/90'
          }`}>
            {isSavings ? (
              <>
                <p className="text-white/90 text-sm mb-1">💰 YOU SAVE</p>
                <p className="text-4xl font-black text-white animate-pulse">
                  {currency} {Math.abs(netChange).toFixed(2)}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  Your site is easier to install than we thought!
                </p>
              </>
            ) : (
              <>
                <p className="text-white/90 text-sm mb-1">Updated Total</p>
                <p className="text-3xl font-bold text-white">
                  +{currency} {Math.abs(netChange).toFixed(2)}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  Additional items for proper coverage
                </p>
              </>
            )}
          </div>
        )}

        {/* Admin Note */}
        {revision.adminNote && (
          <div className="mt-4 bg-surface/80 rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSavings ? 'bg-success-bg' : 'bg-info-bg'
              }`}>
                <svg className={`w-4 h-4 ${isSavings ? 'text-success' : 'text-info'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">From Your Installer</p>
                <p className="text-foreground leading-relaxed">{revision.adminNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="flex-1 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showDetails ? 'Hide Details' : 'View Full Changes'}
          </Button>
          <Button
            onClick={() => {
              // Scroll to approval card
              const approvalCard = document.getElementById('approval-card');
              if (approvalCard) {
                approvalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            variant="gradient"
            className="flex-1 rounded-xl shadow-lg hover:opacity-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSavings ? 'Accept & Lock In Savings' : 'Review & Accept'}
          </Button>
        </div>
      </div>

      {/* Detailed Changes (Expandable) */}
      {showDetails && (
        <div className="rounded-xl border-2 border-border bg-surface p-6 shadow-lg mt-4 animate-slideDown">
          <h3 className="text-xl font-bold text-foreground mb-6">What Changed & Why</h3>

          {/* Quantity Changes */}
          {revision.changedItems && revision.changedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-info" />
                <h4 className="font-semibold text-foreground">Quantities Adjusted</h4>
              </div>
              <div className="space-y-3">
                {revision.changedItems.map((item, idx) => (
                  <div key={idx} className="bg-muted rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-info font-semibold">
                        {item.oldQty} → {item.newQty}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added Items */}
          {revision.addedItems && revision.addedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-foreground">Items Added</h4>
              </div>
              <div className="space-y-3">
                {revision.addedItems.map((item, idx) => (
                  <div key={idx} className="bg-success-bg rounded-xl p-4 border border-success/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-success font-semibold">
                        +{currency} {(item.amount * (item.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount */}
          {hasDiscount && revision.discount.value !== 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-foreground">
                  {revision.discount.value > 0 ? '💚 Discount Applied' : 'Fee Applied'}
                </h4>
              </div>
              <div className="bg-gradient-to-r from-success to-success/80 rounded-xl p-6 text-success-foreground">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">{revision.discount.name || 'Special Discount'}</span>
                  <span className="text-2xl font-black">
                    {revision.discount.type === 'percentage' ? `${Math.abs(revision.discount.value)}%` : `-${currency} ${Math.abs(revision.discount.value).toFixed(2)}`}
                  </span>
                </div>
                {revision.discount.reason && (
                  <p className="text-white/90 text-sm">
                    {revision.discount.reason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Net Impact Summary */}
          <div className="bg-gradient-to-r from-foreground/90 to-foreground rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Original Estimate</p>
                <p className="text-xl font-semibold line-through text-white/60">
                  {currency} {(revision.oldTotal || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm mb-1">Updated Estimate</p>
                <p className="text-3xl font-black text-white">
                  {currency} {(revision.newTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>
            {netChange !== 0 && (
              <div className="border-t border-white/20 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/90 font-medium">
                    {isSavings ? '🎊 Total Savings:' : 'Net Change:'}
                  </span>
                  <span className={`text-2xl font-black ${isSavings ? 'text-success' : 'text-info'}`}>
                    {isSavings && '🎉 '}{isSavings ? '-' : '+'}{currency} {Math.abs(netChange).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => setShowDetails(false)}
            variant="ghost"
            className="mt-4 w-full"
          >
            Hide Details ↑
          </Button>
        </div>
      )}
    </>
  );
}

