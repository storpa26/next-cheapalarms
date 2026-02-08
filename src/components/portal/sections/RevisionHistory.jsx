import { useState, memo, useMemo } from 'react';
import { ChevronDown, ChevronUp, Clock, TrendingDown, TrendingUp, Plus, Minus, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { DEFAULT_CURRENCY } from '../../../lib/admin/constants';

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  const num = Number(amount) || 0;
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Single line change for customer view (simplified)
 */
const CustomerLineChange = memo(function CustomerLineChange({ change, currency }) {
  const { action, name, oldQty, newQty, qty, amount, oldAmount, newAmount } = change;
  
  if (action === 'qty') {
    const diff = (newAmount || 0) - (oldAmount || 0);
    const isIncrease = diff > 0;
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isIncrease ? 'text-info' : 'text-success'}`} />
          <span className="text-foreground">{name}</span>
          <span className="text-muted-foreground text-sm">({oldQty} → {newQty})</span>
        </div>
        <span className={`font-semibold ${isIncrease ? 'text-foreground' : 'text-success'}`}>
          {isIncrease ? '+' : '-'}{formatCurrency(Math.abs(diff), currency)}
        </span>
      </div>
    );
  }
  
  if (action === 'add') {
    const total = (amount || 0) * (qty || 1);
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-info" />
          <span className="text-foreground">{name}</span>
          {qty > 1 && <span className="text-muted-foreground text-sm">(×{qty})</span>}
        </div>
        <span className="font-semibold text-foreground">+{formatCurrency(total, currency)}</span>
      </div>
    );
  }
  
  if (action === 'remove') {
    const total = (amount || 0) * (qty || 1);
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4 text-success" />
          <span className="line-through text-muted-foreground">{name}</span>
        </div>
        <span className="font-semibold text-success">-{formatCurrency(total, currency)}</span>
      </div>
    );
  }
  
  return null;
});
CustomerLineChange.displayName = 'CustomerLineChange';

/**
 * Single revision entry for customer view
 */
const CustomerRevisionEntry = memo(function CustomerRevisionEntry({ revision, currency, isLatest }) {
  const [expanded, setExpanded] = useState(isLatest);
  
  const {
    revisedAt,
    adminNote,
    oldTotal,
    newTotal,
    netChange,
    lineChanges = [],
  } = revision;
  
  const isSavings = netChange < 0;
  const hasChanges = lineChanges.length > 0;
  
  // Filter out discount-only changes for cleaner customer view
  const visibleChanges = lineChanges.filter(c => c.action !== 'discount');
  
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${
      isSavings 
        ? 'border-success/30 bg-success-bg/30' 
        : 'border-info/30 bg-info-bg/30'
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isSavings ? (
            <div className="p-2 rounded-full bg-success/20">
              <TrendingDown className="h-5 w-5 text-success" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-info/20">
              <TrendingUp className="h-5 w-5 text-info" />
            </div>
          )}
          <div className="text-left">
            <p className={`font-semibold ${isSavings ? 'text-success' : 'text-info'}`}>
              {isSavings ? 'Price Reduced' : 'Estimate Updated'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(revisedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full font-bold ${
            isSavings 
              ? 'bg-success text-success-foreground' 
              : 'bg-info text-info-foreground'
          }`}>
            {isSavings ? 'Save ' : '+'}{formatCurrency(Math.abs(netChange), currency)}
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Price comparison */}
          <div className="flex items-center justify-between bg-surface/50 rounded-lg p-3">
            <div>
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="text-lg font-semibold line-through text-muted-foreground">
                {formatCurrency(oldTotal, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(newTotal, currency)}
              </p>
            </div>
          </div>
          
          {/* Line changes */}
          {visibleChanges.length > 0 && (
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                What Changed
              </p>
              {visibleChanges.map((change, idx) => (
                <CustomerLineChange key={idx} change={change} currency={currency} />
              ))}
            </div>
          )}
          
          {/* Admin note */}
          {adminNote && (
            <div className={`rounded-lg p-3 ${
              isSavings ? 'bg-success/10 border border-success/20' : 'bg-info/10 border border-info/20'
            }`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">From Your Installer:</p>
              <p className={`text-sm ${isSavings ? 'text-success' : 'text-info'}`}>{adminNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
CustomerRevisionEntry.displayName = 'CustomerRevisionEntry';

/**
 * Revision History component for customer portal
 * Shows edit history in a customer-friendly format
 */
export const RevisionHistory = memo(function RevisionHistory({ 
  revisionHistory = [], 
  revision, // Backward compatibility
  currency = DEFAULT_CURRENCY,
  maxInitialDisplay = 3,
}) {
  const [showAll, setShowAll] = useState(false);
  
  // Build history from either revisionHistory array or single revision
  const history = useMemo(() => {
    if (revisionHistory && revisionHistory.length > 0) {
      // Sort by revisedAt descending (newest first)
      return [...revisionHistory].sort((a, b) => {
        const dateA = new Date(a.revisedAt || 0);
        const dateB = new Date(b.revisedAt || 0);
        return dateB - dateA;
      });
    }
    // Fallback to single revision for backward compatibility
    if (revision && revision.revisedAt) {
      return [revision];
    }
    return [];
  }, [revisionHistory, revision]);
  
  if (history.length === 0) {
    return null; // Don't show if no history
  }
  
  const displayedHistory = showAll ? history : history.slice(0, maxInitialDisplay);
  const hasMore = history.length > maxInitialDisplay;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Estimate Updates
        </h3>
        <span className="text-sm text-muted-foreground">
          {history.length} update{history.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {displayedHistory.map((rev, idx) => (
          <CustomerRevisionEntry 
            key={rev.revisionId || idx} 
            revision={rev} 
            currency={currency}
            isLatest={idx === 0}
          />
        ))}
      </div>
      
      {hasMore && !showAll && (
        <Button
          variant="outline"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          View {history.length - maxInitialDisplay} older update{history.length - maxInitialDisplay !== 1 ? 's' : ''}
        </Button>
      )}
      
      {showAll && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full"
        >
          Show less
        </Button>
      )}
    </div>
  );
});
RevisionHistory.displayName = 'RevisionHistory';
