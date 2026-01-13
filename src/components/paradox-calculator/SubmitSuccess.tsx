"use client";

import { CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { Card } from '../../components/ui/card';

interface SubmitSuccessProps {
  onStartNew: () => void;
}

const SubmitSuccess = ({ onStartNew }: SubmitSuccessProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Quote Submitted!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Thanks for your interest in Paradox Magellan. We'll review your requirements and 
          get back to you within 24 hours with a detailed quote.
        </p>

        <Card className="bg-info-bg border-info/30 rounded-xl p-6 mb-8">
          <h3 className="font-medium text-foreground mb-3">What happens next?</h3>
          <ul className="text-left text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Our team reviews your system requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>We prepare a detailed quote with pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>We'll email or call you to discuss options</span>
            </li>
          </ul>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onStartNew}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Quote
          </Button>
          <Button 
            asChild
            className="bg-secondary hover:bg-secondary/90 gap-2"
          >
            <Link href="/paradox-magellan">
              Back to Magellan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitSuccess;
