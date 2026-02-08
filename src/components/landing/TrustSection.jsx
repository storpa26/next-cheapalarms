import { motion } from 'framer-motion';
import { Shield, Award, Clock, Wrench } from 'lucide-react';

const trustItems = [
  { icon: Shield, title: 'Professional Grade', description: 'Same equipment installers use' },
  { icon: Award, title: 'Australian Support', description: 'Local help when you need it' },
  { icon: Clock, title: 'Quick Setup', description: 'Most systems installed in hours' },
  { icon: Wrench, title: 'Expert Installation', description: 'Licensed installers available' },
];

export default function TrustSection() {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.2) 75%)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3"
              >
                <item.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
              </motion.div>
              <h3 className="font-display font-semibold text-sm md:text-base text-primary-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-primary-foreground/70">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
