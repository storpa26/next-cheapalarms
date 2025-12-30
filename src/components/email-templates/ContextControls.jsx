import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ContextControls({ context, data, onContextChange, onDataChange }) {
  const updateContext = (key, value) => {
    onContextChange({ ...context, [key]: value });
  };

  const updateData = (key, value) => {
    onDataChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Context & Data Controls</h3>
      
      <Tabs defaultValue="context" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="context">User Context</TabsTrigger>
          <TabsTrigger value="data">Email Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="context" className="space-y-4 mt-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNewUser"
                checked={context.isNewUser}
                onCheckedChange={(checked) => updateContext('isNewUser', checked)}
              />
              <label htmlFor="isNewUser" className="text-sm font-medium cursor-pointer">
                New User (First time)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPasswordSet"
                checked={context.hasPasswordSet}
                onCheckedChange={(checked) => updateContext('hasPasswordSet', checked)}
              />
              <label htmlFor="hasPasswordSet" className="text-sm font-medium cursor-pointer">
                Has Password Set
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPreviousEstimates"
                checked={context.hasPreviousEstimates}
                onCheckedChange={(checked) => {
                  updateContext('hasPreviousEstimates', checked);
                  if (checked) {
                    updateContext('estimateCount', Math.max(2, context.estimateCount));
                  } else {
                    updateContext('estimateCount', 1);
                  }
                }}
              />
              <label htmlFor="hasPreviousEstimates" className="text-sm font-medium cursor-pointer">
                Has Previous Estimates
              </label>
            </div>
            
            {context.hasPreviousEstimates && (
            <div className="ml-6 space-y-2">
              <label htmlFor="estimateCount" className="text-xs text-muted-foreground">Estimate Count</label>
              <Input
                id="estimateCount"
                  type="number"
                  min="1"
                  value={context.estimateCount}
                  onChange={(e) => updateContext('estimateCount', parseInt(e.target.value) || 1)}
                  className="h-8"
                />
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Customer Name</label>
              <Input
                value={data.customerName}
                onChange={(e) => updateData('customerName', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Estimate Number</label>
              <Input
                value={data.estimateNumber}
                onChange={(e) => updateData('estimateNumber', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Invoice Number</label>
              <Input
                value={data.invoiceNumber}
                onChange={(e) => updateData('invoiceNumber', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Invoice Total</label>
              <Input
                type="number"
                value={data.invoiceTotal}
                onChange={(e) => updateData('invoiceTotal', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-xs text-muted-foreground">Admin Note</label>
              <Input
                value={data.adminNote}
                onChange={(e) => updateData('adminNote', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Savings Amount</label>
              <Input
                type="number"
                value={data.savingsAmount}
                onChange={(e) => updateData('savingsAmount', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Due Date</label>
              <Input
                value={data.dueDate}
                onChange={(e) => updateData('dueDate', e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

