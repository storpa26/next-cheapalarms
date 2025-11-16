import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    number: 1,
    title: "Perimeter Breach Detected",
    description: "Door contact sensors immediately register unauthorized entry, triggering the system's response protocol.",
    emoji: "🐺",
    color: "wolf",
  },
  {
    number: 2,
    title: "Multi-Sensor Verification",
    description: "The Hub 2 cross-references multiple sensors to confirm the threat, eliminating false alarms while maintaining rapid response.",
    emoji: "🧠",
    color: "accent",
  },
  {
    number: 3,
    title: "Immediate Response Activated",
    description: "Internal and external sirens activate, smart relays secure entry points, and instant notifications are sent to your phone and monitoring center.",
    emoji: "🚨",
    color: "primary",
  },
  {
    number: 4,
    title: "Threat Neutralized",
    description: "You receive instant notification with event details. The intruder is deterred, and your property remains secure.",
    emoji: "🐷",
    color: "accent",
  },
];

export default function StoryRail() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      const scrollTop = -rect.top;
      
      const progress = Math.max(0, Math.min(1, scrollTop / (sectionHeight - windowHeight)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeScene = Math.min(Math.floor(scrollProgress * scenes.length), scenes.length - 1);
  const wolfProgress = scrollProgress * 100;
  
  // Mobile dies sooner: 70% progress and 65% max position vs 85% and 75% on desktop
  const eliminationThreshold = isMobile ? 70 : 85;
  const maxWolfPosition = isMobile ? 65 : 75;

  return (
    <>
      <style jsx>{`
        .gradient-teal {
          background: linear-gradient(135deg, hsl(187, 100%, 42%) 0%, hsl(187, 100%, 35%) 100%);
        }
        .gradient-accent {
          background: linear-gradient(135deg, hsl(330, 85%, 55%) 0%, hsl(340, 85%, 50%) 100%);
        }
        .bg-wolf {
          background-color: hsl(220, 30%, 25%);
        }
        .shadow-floating {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .shadow-elevated {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .shadow-soft {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes door-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-3px) rotate(-2deg); }
          20% { transform: translateX(3px) rotate(2deg); }
          30% { transform: translateX(-3px) rotate(-2deg); }
          40% { transform: translateX(3px) rotate(2deg); }
          50% { transform: translateX(0) rotate(0deg); }
        }
        @keyframes red-pulse {
          0%, 100% { opacity: 0.3; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { opacity: 1; box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0.5); }
        }
        @keyframes sensor-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes sensor-connect {
          0% { width: 0%; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes sound-wave {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shield-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.5)); }
          50% { filter: drop-shadow(0 0 15px rgba(34, 197, 94, 0.8)); }
        }
        @keyframes shield-expand {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        .animate-door-shake {
          animation: door-shake 0.5s ease-in-out;
        }
        .animate-red-pulse {
          animation: red-pulse 1.5s ease-in-out infinite;
        }
        .animate-sensor-pulse {
          animation: sensor-pulse 0.8s ease-in-out infinite;
        }
        .animate-sound-wave {
          animation: sound-wave 2s ease-out infinite;
        }
        .animate-shield-glow {
          animation: shield-glow 2s ease-in-out infinite;
        }
        .animate-shield-expand {
          animation: shield-expand 1.5s ease-in-out infinite;
        }
        .text-accent {
          color: hsl(187, 100%, 42%);
        }
        .border-accent {
          border-color: hsl(187, 100%, 42%);
        }
        .ring-accent\/50 {
          --tw-ring-color: hsl(187, 100%, 42% / 0.5);
        }
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px hsl(187, 100%, 42% / 0.3), 0 0 40px hsl(187, 100%, 42% / 0.2);
          }
          50% {
            box-shadow: 0 0 30px hsl(187, 100%, 42% / 0.5), 0 0 60px hsl(187, 100%, 42% / 0.3);
          }
        }
      `}</style>
      <section 
        ref={sectionRef} 
        className="py-32 px-4 bg-gradient-to-b from-background via-muted/20 to-background min-h-[200vh] relative"
      >
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 sticky top-8 z-10">
            What Happens During a Break-In Attempt
          </h2>
          
          {/* Wolf and Pig progress indicators */}
          <div className="sticky top-32 mb-16 z-20">
            <div className="relative h-24 bg-muted/30 rounded-full backdrop-blur-sm border border-border/50 shadow-elevated overflow-visible">
              {/* Progress bar */}
              <div 
                className="absolute inset-y-0 left-0 gradient-teal transition-all duration-300 rounded-full"
                style={{ width: `${wolfProgress}%` }}
              />
              
              {/* Scene 1 Animation: Door Break (12.5%) - Delayed activation */}
              {scrollProgress > 0.05 && (
                <div 
                  className="absolute z-30"
                  style={{ 
                    top: '50%',
                    left: '12.5%', 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div className={`relative ${activeScene === 0 && scrollProgress > 0.08 ? 'animate-door-shake animate-red-pulse' : 'opacity-40'}`}>
                    <span className="text-3xl block">🚪</span>
                    {activeScene === 0 && scrollProgress > 0.08 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-red-pulse" />
                    )}
                  </div>
                </div>
              )}
              
              {/* Scene 2 Animation: Sensor Network (37.5%) */}
              {activeScene >= 1 && (
                <div 
                  className="absolute z-30"
                  style={{ 
                    top: '50%',
                    left: '37.5%', 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div className={`relative ${activeScene === 1 ? '' : 'opacity-40'}`}>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="relative flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full bg-teal-500 ${activeScene === 1 ? 'animate-sensor-pulse' : ''}`}
                            style={{ 
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '0.8s'
                            }}
                          />
                          {i < 2 && activeScene === 1 && (
                            <div 
                              className="w-4 h-0.5 bg-teal-500/30 relative overflow-hidden"
                            >
                              <div 
                                className="absolute inset-0 bg-teal-500"
                                style={{ 
                                  width: '0%',
                                  animation: `sensor-connect 0.4s ease-out ${(i + 1) * 0.2}s forwards`
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scene 3 Animation: Sound Waves (62.5%) */}
              {activeScene >= 2 && (
                <div 
                  className="absolute z-30"
                  style={{ 
                    top: '50%',
                    left: '62.5%', 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div className={`relative ${activeScene === 2 ? '' : 'opacity-40'}`}>
                    <span className="text-3xl block relative z-10">🔊</span>
                    {activeScene === 2 && (
                      <>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500/50 animate-sound-wave"
                            style={{
                              width: `${20 + i * 15}px`,
                              height: `${20 + i * 15}px`,
                              animationDelay: `${i * 0.3}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Scene 4 Animation: Shield (87.5%) */}
              {activeScene >= 3 && (
                <div 
                  className="absolute z-30"
                  style={{ 
                    top: '50%',
                    left: '87.5%', 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div className={`relative ${activeScene === 3 ? 'animate-shield-glow' : 'opacity-40'}`}>
                    <span className="text-3xl block">🛡️</span>
                    {activeScene === 3 && (
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500/50 animate-shield-expand"
                        style={{
                          width: '40px',
                          height: '40px'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Pig at end */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl z-10 animate-bounce" style={{ transform: 'translateY(-50%)' }}>
                🐷
              </div>
              
              {/* Wolf moving */}
              <div 
                className="absolute text-6xl transition-all duration-300 z-20"
                style={{ 
                  top: '50%',
                  left: `${Math.min(wolfProgress, maxWolfPosition)}%`,
                  transform: `translate(-50%, -50%) ${wolfProgress >= eliminationThreshold ? 'scale(0.5)' : 'scale(1)'}`,
                  filter: wolfProgress >= eliminationThreshold ? 'grayscale(1) brightness(0.5)' : 'none'
                }}
              >
                {wolfProgress < eliminationThreshold ? '🐺' : null}
                {wolfProgress >= eliminationThreshold && (
                  <span className="text-6xl animate-scale-in block">❌</span>
                )}
              </div>
            </div>
          </div>

          {/* Scene cards */}
          <div className="relative space-y-32 mt-32">
            {scenes.map((scene, index) => {
              const isActive = index <= activeScene;
              const isCurrentScene = index === activeScene;
              
              return (
                <div key={index} className="relative">
                  {/* Connecting dashed line */}
                  {index < scenes.length - 1 && (
                    <svg 
                      className="absolute left-1/2 top-full w-1 h-32 -translate-x-1/2 overflow-visible"
                      style={{ zIndex: 0 }}
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="50"
                        y2="128"
                        stroke="hsl(187, 100%, 42%)"
                        strokeWidth="3"
                        strokeDasharray="10 10"
                        strokeOpacity={isActive ? "1" : "0.3"}
                        className="transition-all duration-500"
                      />
                    </svg>
                  )}
                  
                  <Card 
                    className={`
                      p-8 max-w-md mx-auto glass border-2 transition-all duration-500
                      ${isActive ? 'shadow-floating border-accent scale-100 opacity-100' : 'shadow-soft border-border/30 scale-95 opacity-40'}
                      ${isCurrentScene ? 'ring-4 ring-accent/50 animate-glow-pulse' : ''}
                      ${index % 2 === 0 ? 'md:ml-auto md:mr-16' : 'md:mr-auto md:ml-16'}
                    `}
                    style={{
                      transform: `translateY(${isActive ? 0 : 20}px)`,
                      ...(isCurrentScene && { '--tw-ring-color': 'hsl(187, 100%, 42% / 0.5)' }),
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Scene number badge */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold
                        ${scene.color === 'wolf' ? 'bg-wolf' : 
                          scene.color === 'primary' ? 'gradient-accent' : 
                          'gradient-teal'}
                        shadow-elevated transition-all duration-500
                        ${isActive ? 'scale-100' : 'scale-75'}
                      `}>
                        {scene.number}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl">{scene.emoji}</span>
                          <div className="text-xs font-bold text-accent uppercase tracking-wider">
                            Scene {scene.number}
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{scene.title}</h3>
                        <p className="text-muted-foreground">{scene.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Final message */}
          <div className={`
            mt-32 text-center transition-all duration-700
            ${scrollProgress > 0.9 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            <div className="text-7xl mb-4">✅</div>
            <h3 className="text-3xl font-bold mb-4">Complete Protection in Seconds</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The Ajax Hub 2 coordinates all security devices simultaneously, delivering professional-grade protection with sub-second response times. Your home stays secure, even when you're not there.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
