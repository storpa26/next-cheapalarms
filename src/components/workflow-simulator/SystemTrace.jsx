import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getStateDiff, formatStateForDisplay } from '@/lib/workflow-simulator/state-manager';
import { computeUIState } from '@/lib/workflow-simulator/status-computer';

// Security: Safe JSON stringify with circular reference detection
function safeStringify(obj, space = 2) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, space);
  } catch (error) {
    return `[Error stringifying: ${error.message}]`;
  }
}

export function SystemTrace({ apiCalls, portalMeta, previousState, eventLog, onClearLog }) {
  const [copiedField, setCopiedField] = useState(null);
  const timeoutRef = useRef(null);
  const uiState = computeUIState(portalMeta);
  const stateDiff = previousState ? getStateDiff(previousState, portalMeta) : {};
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const copyToClipboard = async (text, field) => {
    // Validate text parameter
    if (text == null || typeof text !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('copyToClipboard: Invalid text parameter');
      }
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      // Clear previous timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set new timeout and store reference
      timeoutRef.current = setTimeout(() => {
        setCopiedField(null);
        timeoutRef.current = null;
      }, 2000);
    } catch (error) {
      // Handle clipboard errors gracefully (e.g., permission denied, not available)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Clipboard error:', error);
      }
      // Still show feedback even if clipboard fails
      setCopiedField(field);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopiedField(null);
        timeoutRef.current = null;
      }, 2000);
    }
  };
  
  return (
    <Card className="p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">System Trace</h2>
      
      <Tabs defaultValue="api-calls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-calls">API Calls</TabsTrigger>
          <TabsTrigger value="db-state">DB State</TabsTrigger>
          <TabsTrigger value="ui-state">UI State</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        {/* API Calls Tab */}
        <TabsContent value="api-calls" className="space-y-3 max-h-[600px] overflow-y-auto">
          {(!apiCalls || apiCalls.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">No API calls yet</p>
          ) : (
            apiCalls.map((call, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={call.response?.status === 200 ? 'default' : 'destructive'}>
                      {call.method || 'N/A'}
                    </Badge>
                    <span className="text-sm font-mono text-xs">{call.endpoint || 'N/A'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{call.timestamp || 'N/A'}</span>
                </div>
                
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">Request</summary>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                    {safeStringify(call.request, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-6 text-xs"
                    onClick={() => copyToClipboard(safeStringify(call.request, 2), `req-${index}`)}
                  >
                    {copiedField === `req-${index}` ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Request
                  </Button>
                </details>
                
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">Response</summary>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                    {safeStringify(call.response, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-6 text-xs"
                    onClick={() => copyToClipboard(safeStringify(call.response, 2), `res-${index}`)}
                  >
                    {copiedField === `res-${index}` ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Response
                  </Button>
                </details>
                
                {call.duration && (
                  <p className="text-xs text-muted-foreground mt-2">Duration: {call.duration}</p>
                )}
              </div>
            ))
          )}
        </TabsContent>
        
        {/* DB State Tab */}
        <TabsContent value="db-state" className="space-y-3 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Before (Previous State)</h3>
              <pre className="p-3 bg-muted rounded text-xs overflow-x-auto max-h-[500px]">
                {previousState ? formatStateForDisplay(previousState) : 'No previous state'}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm">After (Current State)</h3>
              <pre className="p-3 bg-muted rounded text-xs overflow-x-auto max-h-[500px]">
                {formatStateForDisplay(portalMeta)}
              </pre>
            </div>
          </div>
          
          {Object.keys(stateDiff).length > 0 && (
            <div className="mt-4 p-4 rounded-lg border border-success/30 bg-success/10">
              <h3 className="font-semibold mb-2 text-sm">Changes Detected:</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(stateDiff).map(([path, diff]) => {
                  const before = diff?.before;
                  const after = diff?.after;
                  return (
                    <div key={path} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-mono font-medium">{path}:</span>
                        <span className="text-muted-foreground ml-2">
                          {safeStringify(before)} → {safeStringify(after)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => copyToClipboard(formatStateForDisplay(portalMeta), 'full-state')}
          >
            {copiedField === 'full-state' ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy Full State
          </Button>
        </TabsContent>
        
        {/* UI State Tab */}
        <TabsContent value="ui-state" className="space-y-3 max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Display Status</h3>
              <Badge variant="outline" className="text-base px-3 py-1">
                {uiState.displayStatus}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">{uiState.statusMessage}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-sm">Customer Actions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Can Upload Photos:</span>
                  {uiState.canUploadPhotos ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Can Submit Photos:</span>
                  {uiState.canSubmitPhotos ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Can Accept:</span>
                  {uiState.canAccept ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Can Pay:</span>
                  {uiState.canPay ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-sm">Why Can't I Accept?</h3>
              <div className="p-3 rounded-lg border border-border bg-muted text-xs space-y-1">
                <div className="flex items-center gap-2">
                  {uiState.canAcceptReason.acceptance_enabled ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span>Acceptance enabled: {uiState.canAcceptReason.acceptance_enabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {uiState.canAcceptReason.not_accepted ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span>Not already accepted: {uiState.canAcceptReason.not_accepted ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {uiState.canAcceptReason.not_rejected ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span>Not rejected: {uiState.canAcceptReason.not_rejected ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {uiState.canAcceptReason.photos_ok ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span>Photos OK (if required): {uiState.canAcceptReason.photos_ok ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-sm">Visibility Flags</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Invoice Visible:</span>
                  {uiState.invoiceVisible ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span>Accept Button Visible:</span>
                  {uiState.acceptButtonVisible ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events" className="space-y-3 max-h-[600px] overflow-y-auto">
          {(!eventLog || eventLog.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events yet</p>
          ) : (
            <div className="space-y-3">
              {eventLog.map((event, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    event.actor === 'admin'
                      ? 'border-blue-500/30 bg-blue-500/10'
                      : event.actor === 'customer'
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-gray-500/30 bg-gray-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">{event.timestamp || 'N/A'}</span>
                      <Badge
                        variant={
                          event.actor === 'admin'
                            ? 'default'
                            : event.actor === 'customer'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {event.actor?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="font-semibold text-sm mb-2">{event.action || 'N/A'}</p>
                  
                  {event.apiCall && (
                    <div className="text-xs text-muted-foreground mb-2">
                      API: {event.apiCall?.method || 'N/A'} {event.apiCall?.endpoint || 'N/A'}
                    </div>
                  )}
                  
                  {Object.keys(event.changes || {}).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">Changes</summary>
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                        {safeStringify(event.changes, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {eventLog && eventLog.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={onClearLog}
            >
              Clear Log
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

