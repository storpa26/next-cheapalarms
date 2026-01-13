"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CalculatorProvider, useCalculator } from '../contexts/CalculatorContext';
import { CALCULATOR_STEPS } from '../types/paradox-calculator';
import ProgressIndicator from '../components/paradox-calculator/ProgressIndicator';
import QuoteSummary from '../components/paradox-calculator/QuoteSummary';
import PropertyTypeStep from '../components/paradox-calculator/PropertyTypeStep';
import ControlPanelStep from '../components/paradox-calculator/ControlPanelStep';
import KeypadsStep from '../components/paradox-calculator/KeypadsStep';
import RemotesStep from '../components/paradox-calculator/RemotesStep';
import MotionDetectorsStep from '../components/paradox-calculator/MotionDetectorsStep';
import OutdoorMotionStep from '../components/paradox-calculator/OutdoorMotionStep';
import DoorContactsStep from '../components/paradox-calculator/DoorContactsStep';
import SirensStep from '../components/paradox-calculator/SirensStep';
import SmokeDetectorsStep from '../components/paradox-calculator/SmokeDetectorsStep';
import AccessoriesStep from '../components/paradox-calculator/AccessoriesStep';
import ReviewStep from '../components/paradox-calculator/ReviewStep';
import SubmitSuccess from '../components/paradox-calculator/SubmitSuccess';
import WarningModal from '../components/paradox-calculator/WarningModal';

const CalculatorContent = () => {
  const { 
    state, 
    nextStep, 
    prevStep, 
    hasKeypad, 
    hasSiren,
    resetCalculator,
  } = useCalculator();
  
  const [submitted, setSubmitted] = useState(false);
  const [showKeypadWarning, setShowKeypadWarning] = useState(false);
  const [showSirenWarning, setShowSirenWarning] = useState(false);

  const currentStep = state.currentStep;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === CALCULATOR_STEPS.length;
  const isApartment = state.propertyInfo.type === 'apartment';

  // Validation for proceeding
  const canProceed = () => {
    if (currentStep === 3 && !hasKeypad()) return false; // Keypads required
    return true;
  };

  const handleNext = () => {
    // Keypad validation
    if (currentStep === 3 && !hasKeypad()) {
      setShowKeypadWarning(true);
      return;
    }
    
    // Siren validation
    if (currentStep === 8 && !hasSiren()) {
      setShowSirenWarning(true);
      return;
    }

    // Skip outdoor step for apartments
    if (currentStep === 5 && isApartment) {
      // Skip to step 7 (door contacts)
      nextStep();
      nextStep();
      return;
    }

    nextStep();
  };

  const handleBack = () => {
    // Handle skipped outdoor step
    if (currentStep === 7 && isApartment) {
      prevStep();
      prevStep();
      return;
    }
    prevStep();
  };

  const handleSubmit = (userInfo: any) => {
    console.log('Quote submitted:', { cart: state.cart, userInfo });
    setSubmitted(true);
  };

  const handleStartNew = () => {
    resetCalculator();
    setSubmitted(false);
  };

  if (submitted) {
    return <SubmitSuccess onStartNew={handleStartNew} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PropertyTypeStep />;
      case 2: return <ControlPanelStep />;
      case 3: return <KeypadsStep />;
      case 4: return <RemotesStep />;
      case 5: return <MotionDetectorsStep />;
      case 6: return <OutdoorMotionStep />;
      case 7: return <DoorContactsStep />;
      case 8: return <SirensStep />;
      case 9: return <SmokeDetectorsStep />;
      case 10: return <AccessoriesStep />;
      case 11: return <ReviewStep onSubmit={handleSubmit} />;
      default: return <PropertyTypeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/paradox-magellan" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Magellan
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Quote Calculator</h1>
          </div>
          <ProgressIndicator />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>

      {/* Footer with navigation */}
      {!isLastStep && (
        <QuoteSummary
          onNext={handleNext}
          onBack={handleBack}
          showBack={!isFirstStep}
          nextLabel={currentStep === 10 ? 'Review Quote' : 'Continue'}
          nextDisabled={!canProceed()}
          validationError={currentStep === 3 && !hasKeypad() ? 'Select at least one keypad' : undefined}
        />
      )}

      {/* Warning modals */}
      <WarningModal
        open={showKeypadWarning}
        onClose={() => setShowKeypadWarning(false)}
        onConfirm={() => setShowKeypadWarning(false)}
        title="Keypad Required"
        description="You need at least one keypad to arm and disarm your security system. Please add a keypad before continuing."
        confirmLabel="I understand"
        cancelLabel="Go back"
      />

      <WarningModal
        open={showSirenWarning}
        onClose={() => setShowSirenWarning(false)}
        onConfirm={() => {
          setShowSirenWarning(false);
          nextStep();
        }}
        title="No Siren Selected"
        description="Your system doesn't have a siren. Without one, intruders won't be deterred by sound and neighbours won't be alerted. Are you sure you want to continue without a siren?"
        confirmLabel="Continue without siren"
        cancelLabel="Add a siren"
      />
    </div>
  );
};

const ParadoxCalculator = () => {
  return (
    <CalculatorProvider>
      <CalculatorContent />
    </CalculatorProvider>
  );
};

export default ParadoxCalculator;
