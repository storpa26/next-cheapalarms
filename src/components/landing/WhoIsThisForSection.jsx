import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Building2, Home, Castle } from 'lucide-react';

const homeTypes = [
  {
    icon: Building2,
    title: 'Apartment / Unit',
    features: ['1-2 door sensors', '1 motion sensor', '1 keypad', 'Basic siren'],
    color: 'from-info to-secondary',
    recommended: 'Starter pack',
  },
  {
    icon: Home,
    title: 'Family Home',
    features: [
      '4-6 door/window sensors',
      '2-3 motion sensors',
      'Front & back keypad',
      'Indoor + outdoor siren',
      '2-3 remote controls',
    ],
    color: 'from-primary to-primary/80',
    recommended: 'Most popular',
    featured: true,
  },
  {
    icon: Castle,
    title: 'Large Property',
    features: [
      '8+ door/window sensors',
      '4+ motion sensors',
      'Outdoor motion sensors',
      'Multiple keypads',
      'Zone expansion',
      'App monitoring',
    ],
    color: 'from-primary via-secondary to-secondary',
    recommended: 'Full coverage',
  },
];

export default function WhoIsThisForSection() {
  const ref = useRef(null);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted to-background" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Find Your Fit
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Who Is This For?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re in a small apartment or a large home, there&apos;s a perfect setup for you.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {homeTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className={type.featured ? 'md:-mt-4 md:mb-4' : ''}
            >
              <div
                className={`relative h-full p-6 rounded-2xl border border-border bg-card shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  type.featured ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                {type.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                      {type.recommended}
                    </span>
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}
                >
                  <type.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-4">
                  {type.title}
                </h3>
                <ul className="space-y-3">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!type.featured && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-xs font-medium text-muted-foreground">
                      {type.recommended}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
