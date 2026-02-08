import { useState, memo, useMemo } from 'react';
import { ChevronDown, ChevronUp, Clock, User, Plus, Minus, RefreshCw, Percent, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DEFAULT_CURRENCY } from '../../lib/admin/constants';

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  const num = Number(amount) || 0;
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

/**
 * Format full date/time
 */
function formatDateTime(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Single line change item
 */
const LineChangeItem = memo(function LineChangeItem({ change, currency }) {
  const { action, name, oldQty, newQty, qty, amount, oldAmount, newAmount, type, value } = change;
  
  if (action === 'qty') {
    const diff = (newAmount || 0) - (oldAmount || 0);
    const isIncrease = diff > 0;
    return (
      <div className="flex items-center justify-between py-1.5 text-sm border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-info" />
          <span className="text-foreground">{name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            {oldQty} → {newQty}
          </span>
          <span className={`font-medium ${isIncrease ? 'text-error' : 'text-success'}`}>
            {isIncrease ? '+' : ''}{formatCurrency(diff, currency)}
          </span>
        </div>
      </div>
    );
  }
  
  if (action === 'add') {
    const total = (amount || 0) * (qty || 1);
    return (
      <div className="flex items-center justify-between py-1.5 text-sm border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <Plus className="h-3.5 w-3.5 text-success" />
          <span className="text-foreground">{name}</span>
          {qty > 1 && <span className="text-muted-foreground text-xs">(×{qty})</span>}
        </div>
        <span className="font-medium text-error">+{formatCurrency(total, currency)}</span>
      </div>
    );
  }
  
  if (action === 'remove') {
    const total = (amount || 0) * (qty || 1);
    return (
      <div className="flex items-center justify-between py-1.5 text-sm border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <Minus className="h-3.5 w-3.5 text-error" />
          <span className="line-through text-muted-foreground">{name}</span>
        </div>
        <span className="font-medium text-success">-{formatCurrency(total, currency)}</span>
      </div>
    );
  }
  
  if (action === 'discount') {
    const icon = type === 'percentage' ? Percent : DollarSign;
    const Icon = icon;
    return (
      <div className="flex items-center justify-between py-1.5 text-sm border-b border-border/30 last:border-0">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-info" />
          <span className="text-foreground">
            {type === 'percentage' ? `${value}% discount` : `${formatCurrency(value, currency)} discount`}
          </span>
        </div>
      </div>
    );
  }
  
  return null;
});
LineChangeItem.displayName = 'LineChangeItem';

/**
 * Single revision entry
 */
const RevisionEntry = memo(function RevisionEntry({ revision, currency, isFirst }) {
  const [expanded, setExpanded] = useState(isFirst);
  
  const {
    revisionId,
    revisedAt,
    revisedBy,
    adminNote,
    oldTotal,
    newTotal,
    netChange,
    lineChanges = [],
  } = revision;
  
  const isSavings = netChange < 0;
  const hasChanges = lineChanges.length > 0;
  
  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${
        isSavings ? 'bg-success border-success' : 'bg-info border-info'
      }`} />
      
      {/* Timeline line */}
      <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border last:hidden" />
      
      {/* Revision card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header (always visible) */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {formatRelativeTime(revisedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {revisedBy?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={isSavings ? 'success' : 'default'} className="font-semibold">
              {isSavings ? '-' : '+'}{formatCurrency(Math.abs(netChange), currency)}
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        
        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border p-3 space-y-3">
            {/* Totals */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(oldTotal, currency)} → {formatCurrency(newTotal, currency)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(revisedAt)}
              </span>
            </div>
            
            {/* Line changes */}
            {hasChanges && (
              <div className="rounded-lg bg-muted/30 p-2">
                {lineChanges.map((change, idx) => (
                  <LineChangeItem key={idx} change={change} currency={currency} />
                ))}
              </div>
            )}
            
            {/* Admin note */}
            {adminNote && (
              <div className="rounded-lg bg-info-bg/50 border border-info/20 p-2">
                <p className="text-xs text-muted-foreground mb-1">Note:</p>
                <p className="text-sm text-foreground">{adminNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
RevisionEntry.displayName = 'RevisionEntry';

/**
 * Edit History Timeline component for admin dashboard
 * Shows all revisions with line-by-line changes
 */
export const EditHistoryTimeline = memo(function EditHistoryTimeline({ 
  revisionHistory = [], 
  revision, // Backward compatibility: single latest revision
  currency = DEFAULT_CURRENCY,
  maxInitialDisplay = 5,
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
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Edit History</h3>
        <p className="text-sm text-muted-foreground">No edits have been made to this estimate yet.</p>
      </div>
    );
  }
  
  const displayedHistory = showAll ? history : history.slice(0, maxInitialDisplay);
  const hasMore = history.length > maxInitialDisplay;
  
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Edit History
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            ({history.length} revision{history.length !== 1 ? 's' : ''})
          </span>
        </h3>
      </div>
      
      <div className="relative">
        {displayedHistory.map((rev, idx) => (
          <RevisionEntry 
            key={rev.revisionId || idx} 
            revision={rev} 
            currency={currency}
            isFirst={idx === 0}
          />
        ))}
      </div>
      
      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full mt-2"
        >
          Show {history.length - maxInitialDisplay} more revision{history.length - maxInitialDisplay !== 1 ? 's' : ''}
        </Button>
      )}
      
      {showAll && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full mt-2"
        >
          Show less
        </Button>
      )}
    </div>
  );
});
EditHistoryTimeline.displayName = 'EditHistoryTimeline';
