import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { getCurrentStep } from '@/lib/workflow-simulator/steps';

const SYSTEM_ICONS = {
  ghl: '🔵',
  xero: '🟢',
  wordpress: '⚙️',
  email: '📧',
};

const SYSTEM_NAMES = {
  ghl: 'GoHighLevel',
  xero: 'Xero',
  wordpress: 'WordPress',
  email: 'Email',
};

export function ExternalSystemsTimeline({ portalMeta, externalSystems }) {
  const [expanded, setExpanded] = useState({});
  const currentStep = getCurrentStep(portalMeta);

  const systems = [
    {
      id: 'ghlEstimate',
      name: 'GHL Estimate',
      icon: 'ghl',
      status: externalSystems?.ghlEstimate?.status || 'pending',
      step: externalSystems?.ghlEstimate?.step,
      timestamp: externalSystems?.ghlEstimate?.timestamp,
      details: externalSystems?.ghlEstimate?.details,
    },
    {
      id: 'ghlInvoice',
      name: 'GHL Invoice',
      icon: 'ghl',
      status: externalSystems?.ghlInvoice?.status || 'pending',
      step: externalSystems?.ghlInvoice?.step,
      timestamp: externalSystems?.ghlInvoice?.timestamp,
      details: externalSystems?.ghlInvoice?.details,
    },
    {
      id: 'xeroInvoice',
      name: 'Xero Invoice',
      icon: 'xero',
      status: externalSystems?.xeroInvoice?.status || 'pending',
      step: externalSystems?.xeroInvoice?.step,
      timestamp: externalSystems?.xeroInvoice?.timestamp,
      details: externalSystems?.xeroInvoice?.details,
    },
    {
      id: 'wordpressMeta',
      name: 'WordPress Meta',
      icon: 'wordpress',
      status: externalSystems?.wordpressMeta?.status || 'active',
      step: externalSystems?.wordpressMeta?.lastStep,
      timestamp: externalSystems?.wordpressMeta?.lastUpdated,
      details: externalSystems?.wordpressMeta?.details,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
      case 'active':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return (
          <Badge className="bg-yellow-500">
            <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
            In Progress
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const toggleExpand = (systemId) => {
    setExpanded((prev) => ({
      ...prev,
      [systemId]: !prev[systemId],
    }));
  };

  return (
    <Card className="p-4 h-full">
      <h3 className="font-semibold text-sm mb-4">External Systems Timeline</h3>
      <div className="space-y-3">
        {systems.map((system) => (
          <div key={system.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{SYSTEM_ICONS[system.icon]}</span>
                <span className="font-medium text-sm">{system.name}</span>
              </div>
              {getStatusBadge(system.status)}
            </div>

            {system.step && (
              <div className="text-xs text-muted-foreground mb-2">
                Step {system.step} • {system.timestamp ? new Date(system.timestamp).toLocaleTimeString() : 'N/A'}
              </div>
            )}

            {system.status === 'pending' && !system.step && (
              <div className="text-xs text-muted-foreground mb-2">
                Will activate in step {system.expectedStep || 'later'}
              </div>
            )}

            {system.details && (
              <button
                onClick={() => toggleExpand(system.id)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                {expanded[system.id] ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show Details
                  </>
                )}
              </button>
            )}

            {expanded[system.id] && system.details && (
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(system.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

