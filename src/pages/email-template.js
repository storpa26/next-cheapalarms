import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailPreview } from '@/components/email-templates/EmailPreview';
import { EmailTypeSelector } from '@/components/email-templates/EmailTypeSelector';
import { ContextControls } from '@/components/email-templates/ContextControls';
import { EmailCodeView } from '@/components/email-templates/EmailCodeView';
import { detectEmailVariation, getEmailTemplate } from '@/lib/email-templates/context';

export default function EmailTemplatePage() {
  const [selectedType, setSelectedType] = useState('quote-request');
  const [selectedVariation, setSelectedVariation] = useState('A');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  
  // Context state
  const [context, setContext] = useState({
    isNewUser: true,
    hasPasswordSet: false,
    hasPreviousEstimates: false,
    estimateCount: 1,
    previousEstimateNumbers: [],
    lastLoginAt: null,
  });
  
  // Data state
  const [data, setData] = useState({
    customerName: 'John Smith',
    estimateNumber: 'EST-2024-001',
    estimateId: 'est_123456',
    invoiceNumber: 'INV-2024-001',
    invoiceTotal: 2500.00,
    portalUrl: 'https://portal.cheapalarms.com/portal?token=abc123',
    resetUrl: 'https://portal.cheapalarms.com/set-password?key=reset123',
    loginUrl: 'https://portal.cheapalarms.com/login',
    adminNote: 'We\'ve reviewed your requirements and prepared this estimate.',
    bookingDate: '2024-01-15',
    bookingTime: '10:00 AM',
    paymentAmount: 2500.00,
    savingsAmount: 500.00,
    dueDate: '2024-01-20',
  });

  // Detect which variation to show based on context
  const detectedVariation = useMemo(() => {
    return detectEmailVariation(selectedType, context);
  }, [selectedType, context]);

  // Get the email template component
  const EmailComponent = useMemo(() => {
    const component = getEmailTemplate(selectedType, selectedVariation || detectedVariation);
    if (typeof window !== 'undefined') {
      console.log('EmailComponent:', {
        selectedType,
        selectedVariation,
        detectedVariation,
        component: component?.name || 'null',
        hasComponent: !!component
      });
    }
    return component;
  }, [selectedType, selectedVariation, detectedVariation]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Email Template Preview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preview all customer-facing email variations with context-aware personalization
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Email Type Selector */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <EmailTypeSelector
                selectedType={selectedType}
                selectedVariation={selectedVariation}
                onTypeChange={setSelectedType}
                onVariationChange={setSelectedVariation}
                detectedVariation={detectedVariation}
              />
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Context Controls */}
            <Card className="p-4">
              <ContextControls
                context={context}
                data={data}
                onContextChange={setContext}
                onDataChange={setData}
              />
            </Card>

            {/* Email Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                {detectedVariation !== selectedVariation && (
                  <Badge variant="outline">
                    Auto-detected: {detectedVariation}
                  </Badge>
                )}
              </div>
              
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">HTML Code</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <EmailPreview
                    EmailComponent={EmailComponent}
                    context={context}
                    data={data}
                    variation={selectedVariation || detectedVariation}
                  />
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <EmailCodeView
                    EmailComponent={EmailComponent}
                    context={context}
                    data={data}
                    variation={selectedVariation || detectedVariation}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

