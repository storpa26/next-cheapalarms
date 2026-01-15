"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorProvider, useCalculator } from '../../contexts/CalculatorContext';
import { CALCULATOR_STEPS } from '../../types/paradox-calculator';
import ProgressIndicator from '../../components/paradox-calculator/ProgressIndicator';
import QuoteSummary from '../../components/paradox-calculator/QuoteSummary';
import PropertyTypeStep from '../../components/paradox-calculator/PropertyTypeStep';
import ControlDevicesStep from '../../components/paradox-calculator/ControlDevicesStep';
import MotionDetectorsStep from '../../components/paradox-calculator/MotionDetectorsStep';
import OutdoorMotionStep from '../../components/paradox-calculator/OutdoorMotionStep';
import EntryProtectionStep from '../../components/paradox-calculator/EntryProtectionStep';
import SafetyExtrasStep from '../../components/paradox-calculator/SafetyExtrasStep';
import ReviewStep from '../../components/paradox-calculator/ReviewStep';
import SubmitSuccess from '../../components/paradox-calculator/SubmitSuccess';
import WarningModal from '../../components/paradox-calculator/WarningModal';
import ScrollIndicator from '../../components/paradox-calculator/ScrollIndicator';

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
    if (currentStep === 2 && !hasKeypad()) return false; // Keypads required (now step 2)
    return true;
  };

  const handleNext = () => {
    // Keypad validation (now step 2)
    if (currentStep === 2 && !hasKeypad()) {
      setShowKeypadWarning(true);
      return;
    }
    
    // Siren validation (now step 5)
    if (currentStep === 5 && !hasSiren()) {
      setShowSirenWarning(true);
      return;
    }

    // Skip outdoor step for apartments (now step 4)
    if (currentStep === 4 && isApartment) {
      // Skip to step 5 (entry protection)
      nextStep();
      return;
    }

    nextStep();
  };

  const handleBack = () => {
    // Handle skipped outdoor step (now step 4)
    if (currentStep === 5 && isApartment) {
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
      case 2: return <ControlDevicesStep />;
      case 3: return <MotionDetectorsStep />;
      case 4: return <OutdoorMotionStep />;
      case 5: return <EntryProtectionStep />;
      case 6: return <SafetyExtrasStep />;
      case 7: return <ReviewStep onSubmit={handleSubmit} />;
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
      <main className="container mx-auto px-4 py-8 relative">
        <ScrollIndicator />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with navigation */}
      {!isLastStep && (
        <QuoteSummary
          onNext={handleNext}
          onBack={handleBack}
          showBack={!isFirstStep}
          nextLabel={currentStep === 6 ? 'Review Quote' : 'Continue'}
          nextDisabled={!canProceed()}
          validationError={currentStep === 2 && !hasKeypad() ? 'Select at least one keypad' : undefined}
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
