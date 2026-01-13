"use client";

import { CALCULATOR_STEPS } from '../../types/paradox-calculator';
import { useCalculator } from '../../contexts/CalculatorContext';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressIndicator = () => {
  const { state } = useCalculator();
  const { currentStep } = state;
  const totalSteps = CALCULATOR_STEPS.length;
  const progressPercentage = Math.max(5, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div className="w-full py-6 px-4 overflow-x-auto bg-background/50 backdrop-blur-sm border-b border-border/50">
      {/* Progress Header */}
      <div className="mb-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-1">
          Quote Calculator Progress
        </p>
        <p className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center mb-4" role="list" aria-label="Calculator steps">
        {CALCULATOR_STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === CALCULATOR_STEPS.length - 1;
          
          return (
            <div 
              key={step.id} 
              className="flex-1 flex items-center"
              role="listitem"
            >
              {/* Step circle and label container */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.15 }}
                  className="relative"
                >
                  {/* Outer glow for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  
                  {/* Circle */}
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-secondary to-secondary-hover text-white shadow-lg shadow-secondary/50' 
                        : ''}
                      ${isCurrent 
                        ? 'bg-gradient-to-br from-primary to-primary-hover text-white shadow-xl shadow-primary/60 ring-4 ring-primary/20' 
                        : ''}
                      ${!isCompleted && !isCurrent 
                        ? 'bg-info-bg text-muted-foreground border-2 border-info/40 shadow-sm' 
                        : ''}
                    `}
                    animate={{
                      scale: isCurrent ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isCurrent ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.span
                        animate={{ 
                          scale: isCurrent ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: isCurrent ? Infinity : 0,
                        }}
                      >
                        {step.id}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>
                
                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    color: isCurrent 
                      ? "hsl(var(--color-foreground))" 
                      : isCompleted
                      ? "hsl(var(--color-secondary))"
                      : "hsl(var(--color-text-muted))",
                    fontWeight: isCurrent ? 600 : isCompleted ? 500 : 400,
                  }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                  className="text-xs mt-2 hidden sm:block text-center"
                >
                  {step.shortName}
                </motion.span>
              </div>
              
              {/* Connector line - with gradient for completed */}
              {!isLast && (
                <div className="flex-1 h-1.5 mx-2 rounded-full overflow-hidden relative bg-info-bg/30">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: isCompleted ? 1 : 0.3,
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className={`
                      h-full origin-left rounded-full
                      ${isCompleted 
                        ? 'bg-gradient-to-r from-secondary via-secondary/80 to-primary shadow-sm shadow-secondary/30' 
                        : 'bg-info/20'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div 
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${Math.round(progressPercentage)}% complete`}
        className="w-full h-1.5 bg-info-bg/30 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] shadow-sm"
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
