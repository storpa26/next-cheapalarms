import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Home, DoorOpen, Eye, Volume2, Smartphone, Shield, Zap } from 'lucide-react';

const demoSteps = [
  {
    id: 'idle',
    title: 'System Armed',
    description: 'Your home is protected. All sensors are active and monitoring.',
    icon: Shield,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    id: 'detect',
    title: 'Motion Detected',
    description: 'A sensor triggers at the back door. The system registers the event.',
    icon: Eye,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    id: 'alert',
    title: 'Siren Activates',
    description: 'Loud siren and strobe light activate immediately to deter the intruder.',
    icon: Volume2,
    color: 'text-error',
    bgColor: 'bg-error/10',
  },
  {
    id: 'notify',
    title: "You're Notified",
    description: "Instant push notification to your phone. You're always in the loop.",
    icon: Smartphone,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export default function InteractiveDemo() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const startDemo = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveStepIndex(0);
    const sequence = [1, 2, 3, 0];
    sequence.forEach((stepIndex, i) => {
      setTimeout(() => {
        setActiveStepIndex(stepIndex);
        if (i === sequence.length - 1) {
          setIsPlaying(false);
        }
      }, (i + 1) * 2000);
    });
  }, [isPlaying]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden bg-foreground"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-6 border border-white/10">
            <Zap className="w-4 h-4" />
            Interactive Demo
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6">
            See It{' '}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Watch how your security system responds to threats in real-time.
          </p>

          <motion.button
            type="button"
            onClick={startDemo}
            disabled={isPlaying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 rounded-full font-semibold transition-all ${
              isPlaying
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl'
            }`}
          >
            {isPlaying ? 'Demo Running...' : 'Start Demo'}
          </motion.button>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: activeStepIndex === 2 ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: activeStepIndex === 2 ? Infinity : 0,
                    }}
                    className="relative"
                  >
                    <Home className="w-32 h-32 text-white/20" strokeWidth={1} />
                    <motion.div
                      animate={{
                        scale: activeStepIndex >= 1 ? [1, 1.5, 1] : 1,
                        opacity: activeStepIndex >= 1 ? 1 : 0.3,
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: activeStepIndex === 1 ? Infinity : 0,
                      }}
                      className="absolute -top-2 right-0"
                    >
                      <DoorOpen
                        className={`w-8 h-8 ${
                          activeStepIndex >= 1 ? 'text-warning' : 'text-white/30'
                        }`}
                      />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: activeStepIndex >= 1 ? [1, 1.3, 1] : 1,
                        opacity: activeStepIndex >= 1 ? 1 : 0.3,
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: activeStepIndex === 1 ? Infinity : 0,
                        delay: 0.2,
                      }}
                      className="absolute top-1/4 -left-4"
                    >
                      <Eye
                        className={`w-6 h-6 ${
                          activeStepIndex >= 1 ? 'text-warning' : 'text-white/30'
                        }`}
                      />
                    </motion.div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {activeStepIndex === 2 && (
                    <>
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-error"
                      />
                      <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-error"
                      />
                    </>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {activeStepIndex === 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, x: 20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-6 right-6 bg-white rounded-xl p-3 shadow-2xl"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Security Alert
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Motion at back door
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              {demoSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  animate={{
                    scale: activeStepIndex === index ? 1.02 : 1,
                    opacity: activeStepIndex === index ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    activeStepIndex === index
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-background mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-white/60">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
