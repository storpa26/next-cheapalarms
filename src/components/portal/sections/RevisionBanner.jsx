import { useState } from 'react';
import { Sparkles, TrendingDown, TrendingUp, Info } from 'lucide-react';

/**
 * Banner shown in customer portal when estimate has been revised
 * Highlights savings or changes with compelling visuals
 */
export function RevisionBanner({ revision, currency = 'AUD', portalStatus }) {
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
      <div className={`rounded-[32px] p-8 shadow-xl ${
        isSavings 
          ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-300'
          : 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 border-2 border-blue-300'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {isSavings ? (
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h2 className={`text-2xl font-bold ${isSavings ? 'text-green-900' : 'text-blue-900'}`}>
              {isSavings ? '🎉 Great News - Your Estimate Has Been Updated!' : '📋 Your Estimate Has Been Updated'}
            </h2>
            <p className={`text-sm ${isSavings ? 'text-green-700' : 'text-blue-700'}`}>
              Updated {new Date(revision.revisedAt).toLocaleDateString()} after reviewing your photos
            </p>
          </div>
        </div>

        {/* Pricing Impact */}
        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Original Price */}
          <div className="bg-white/70 rounded-2xl p-6 border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Original Estimate</p>
            <p className="text-2xl font-semibold text-slate-400 line-through">
              {currency} {(revision.oldTotal || 0).toFixed(2)}
            </p>
          </div>

          {/* New Price */}
          <div className={`rounded-2xl p-6 border-2 ${
            isSavings 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400' 
              : 'bg-gradient-to-br from-blue-500 to-sky-600 border-blue-400'
          }`}>
            <p className="text-xs uppercase tracking-wide text-white/80 mb-2">Your New Price</p>
            <p className="text-3xl font-bold text-white">
              {currency} {(revision.newTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Savings/Change Highlight */}
        {netChange !== 0 && (
          <div className={`rounded-2xl p-6 text-center ${
            isSavings 
              ? 'bg-gradient-to-r from-green-600 to-emerald-700'
              : 'bg-gradient-to-r from-blue-600 to-sky-700'
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
          <div className="mt-6 bg-white/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSavings ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <svg className={`w-4 h-4 ${isSavings ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">From Your Installer</p>
                <p className="text-slate-700 leading-relaxed">{revision.adminNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 rounded-full font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showDetails ? 'Hide Details' : 'View Full Changes'}
          </button>
          <button
            onClick={() => {
              // Scroll to approval card
              const approvalCard = document.getElementById('approval-card');
              if (approvalCard) {
                approvalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className={`flex-1 px-6 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 ${
              isSavings
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-[#1EA6DF] to-[#c95375]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSavings ? 'Accept & Lock In Savings' : 'Review & Accept'}
          </button>
        </div>
      </div>

      {/* Detailed Changes (Expandable) */}
      {showDetails && (
        <div className="rounded-[32px] border-2 border-slate-200 bg-white p-8 shadow-xl mt-4 animate-slideDown">
          <h3 className="text-xl font-bold text-slate-900 mb-6">What Changed & Why</h3>

          {/* Quantity Changes */}
          {revision.changedItems && revision.changedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">Quantities Adjusted</h4>
              </div>
              <div className="space-y-3">
                {revision.changedItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-blue-600 font-semibold">
                        {item.oldQty} → {item.newQty}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-sm text-slate-600 flex items-start gap-2">
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
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-slate-900">Items Added</h4>
              </div>
              <div className="space-y-3">
                {revision.addedItems.map((item, idx) => (
                  <div key={idx} className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-green-600 font-semibold">
                        +{currency} {(item.amount * (item.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-sm text-slate-600">{item.reason}</p>
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
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-slate-900">
                  {revision.discount.value > 0 ? '💚 Discount Applied' : 'Fee Applied'}
                </h4>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
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
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
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
                  <span className={`text-2xl font-black ${isSavings ? 'text-green-300' : 'text-blue-300'}`}>
                    {isSavings && '🎉 '}{isSavings ? '-' : '+'}{currency} {Math.abs(netChange).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDetails(false)}
            className="mt-4 w-full px-4 py-2 text-slate-600 hover:text-slate-800 transition text-sm font-medium"
          >
            Hide Details ↑
          </button>
        </div>
      )}
    </>
  );
}

