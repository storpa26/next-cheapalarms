import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  Radio,
  Eye,
  Bell,
  DoorOpen,
  Flame,
  Settings,
  Heart,
  Star,
  Plus,
  Minus,
  Wifi,
  Battery,
  Smartphone,
  Dog,
  Signal,
  Volume2,
  ThermometerSun,
  Repeat,
} from 'lucide-react';
import { Button } from '../ui/button';

const productImageBase = '/landing/products';

function SingleProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="max-w-sm mx-auto"
    >
      <motion.div
        className="relative overflow-hidden bg-white border border-border rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200"
        animate={{ y: isHovered ? -4 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {product.badge && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide shadow-sm">
              <Star className="w-2.5 h-2.5 fill-current" />
              {product.badge}
            </span>
          </div>
        )}
        <div className="relative h-44 overflow-hidden bg-gradient-to-b from-muted to-white">
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-6"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={`${productImageBase}/${product.image}`}
              alt={product.model}
              width={160}
              height={120}
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </motion.div>
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-bold text-primary shadow-sm">
              {product.model}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-display text-lg font-bold text-foreground">{product.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">{product.tagline}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-foreground/80">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
          <Link href="/paradox-magellan/calculator">
            <Button className="w-full h-9 text-xs font-semibold gap-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg">
              <Heart className="w-3.5 h-3.5" />
              Choose This One
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ComparisonCard({ product, index, isRecommended = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <motion.div
        className={`relative h-full overflow-hidden bg-white border-2 shadow-sm rounded-xl transition-shadow duration-200 hover:shadow-lg ${
          isRecommended ? 'border-secondary/50 ring-2 ring-secondary/20' : 'border-border'
        }`}
        animate={{ y: isHovered ? -4 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isRecommended && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground text-[9px] font-bold uppercase tracking-wider py-1 text-center">
            ✨ Most Popular Choice
          </div>
        )}
        {product.badge && !isRecommended && (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold uppercase">
              {product.badge}
            </span>
          </div>
        )}
        <div className={`relative h-28 overflow-hidden bg-gradient-to-b from-muted to-white ${isRecommended ? 'mt-6' : ''}`}>
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-3"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={`${productImageBase}/${product.image}`}
              alt={product.model}
              width={120}
              height={80}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </motion.div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-bold text-primary">{product.model}</span>
            <h4 className="font-display text-sm font-bold text-foreground truncate">{product.name}</h4>
          </div>
          {product.chooseIf && (
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg px-2.5 py-2 mb-2 border border-secondary/20">
              <span className="text-[9px] font-bold text-secondary uppercase tracking-wide">Choose if:</span>
              <p className="text-[11px] text-foreground/90 font-medium mt-0.5">{product.chooseIf}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.features.slice(0, 2).map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                  <Icon className="w-3 h-3 text-secondary" />
                  <span className="text-[9px] font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
          <Link href="/paradox-magellan/calculator">
            <Button
              size="sm"
              className={`w-full h-7 text-[10px] font-semibold gap-1.5 rounded-md ${
                isRecommended ? 'bg-secondary hover:bg-secondary-hover text-secondary-foreground' : 'bg-primary hover:bg-primary-hover text-primary-foreground'
              }`}
            >
              <Heart className="w-3 h-3" />
              Choose
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CompactComparisonCard({ product, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <motion.div
        className="relative h-full overflow-hidden bg-white border border-border shadow-sm rounded-xl transition-shadow duration-200 hover:shadow-lg"
        animate={{ y: isHovered ? -3 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {product.badge && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold uppercase">
              {product.badge}
            </span>
          </div>
        )}
        <div className="relative h-24 overflow-hidden bg-gradient-to-b from-muted/30 to-white">
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-3"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            <Image
              src={`${productImageBase}/${product.image}`}
              alt={product.model}
              width={80}
              height={60}
              className="w-full h-full object-contain drop-shadow"
            />
          </motion.div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-bold text-primary">{product.model}</span>
            <h4 className="font-display text-[11px] font-bold text-foreground leading-tight truncate">{product.name}</h4>
          </div>
          {product.chooseIf && (
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-md px-2 py-1.5 mb-2 border border-secondary/20">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-wide">Choose if:</span>
              <p className="text-[10px] text-foreground/90 font-medium leading-tight">{product.chooseIf}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.features.slice(0, 2).map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                  <Icon className="w-2.5 h-2.5 text-secondary" />
                  <span className="text-[8px] font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
          <Link href="/paradox-magellan/calculator">
            <Button size="sm" className="w-full h-6 text-[9px] font-semibold gap-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded">
              <Heart className="w-2.5 h-2.5" />
              Choose
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BrainSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const products = [
    {
      model: 'MG5050+',
      name: 'Control Panel',
      tagline: 'The required brain of your security',
      image: 'mg5050.png',
      badge: 'Required',
      features: [
        { icon: Wifi, label: '32 zones' },
        { icon: Battery, label: '24hr backup' },
        { icon: Smartphone, label: 'App ready' },
      ],
    },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <motion.div style={{ scale, opacity }} className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={isInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-5 shadow-xl"
          >
            <Cpu className="w-8 h-8" />
          </motion.div>
          <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">01 — Control Panels</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">The Brain</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">The heart of your security. Every sensor reports here.</p>
        </motion.div>
        <SingleProductCard product={products[0]} />
      </motion.div>
    </motion.section>
  );
}

function KeypadsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);
  const x2 = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  const products = [
    { model: 'K32', name: 'LCD Keypad', tagline: 'See zone names at a glance', image: 'k32.png', badge: 'Popular', chooseIf: 'You want clear text feedback', features: [{ icon: Eye, label: 'LCD display' }, { icon: Zap, label: 'Backlit' }] },
    { model: 'K38', name: 'LED Keypad', tagline: 'Simple & reliable control', image: 'k37.png', chooseIf: 'You prefer simple & budget-friendly', features: [{ icon: Zap, label: 'LED status' }, { icon: Shield, label: 'Compact' }] },
    { model: 'TM50', name: 'Touch Keypad', tagline: 'Modern 5" touchscreen', image: 'k10h.png', badge: 'Premium', chooseIf: 'You want modern touchscreen control', features: [{ icon: Smartphone, label: '5" touch' }, { icon: Eye, label: 'Icons' }] },
    { model: 'TM70', name: 'Touch Pro', tagline: 'Large 7" display', image: 'k10h.png', badge: 'Top Tier', chooseIf: 'You want the largest, premium display', features: [{ icon: Smartphone, label: '7" HD' }, { icon: Star, label: 'Premium' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ x: -24, opacity: 0 }} animate={isInView ? { x: 0, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">02 — Wall Keypads</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Daily Control</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">Arm and disarm with a simple code each day.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.model}
              style={{ x: i % 2 === 0 ? x1 : x2 }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <CompactComparisonCard product={product} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function RemotesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotate1 = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  const products = [
    { model: 'REM15', name: '4-Button Remote', tagline: 'Essential keychain control', image: 'rem15.png', chooseIf: 'You just need basic arm/disarm', features: [{ icon: Radio, label: 'Arm/disarm' }, { icon: Bell, label: 'Panic' }] },
    { model: 'REM25', name: 'Bidirectional Remote', tagline: 'See system status instantly', image: 'rem25.png', badge: 'Best Seller', chooseIf: 'You want confirmation the system responded', features: [{ icon: Repeat, label: '2-way' }, { icon: Eye, label: 'LCD status' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={isInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-lg">
            <Radio className="w-6 h-6" />
          </div>
          <span className="block text-xs font-bold text-secondary uppercase tracking-widest mb-2">03 — Remote Controls</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Pocket Control</h2>
          <p className="text-sm text-muted-foreground">One-click arm & disarm from your keychain.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {products.map((product, i) => (
            <motion.div
              key={product.model}
              style={{ rotate: i === 0 ? rotate1 : rotate2 }}
              initial={{ opacity: 0, y: 60, rotateZ: i === 0 ? -10 : 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateZ: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <ComparisonCard product={product} index={i} isRecommended={i === 1} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function IndoorMotionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    { model: 'PMD2P', name: 'Digital Motion', tagline: 'Reliable room coverage', image: 'pmd2p.png', badge: 'Essential', chooseIf: "You don't have pets", features: [{ icon: Eye, label: '12m range' }, { icon: Wifi, label: '110° wide' }] },
    { model: 'PMD75', name: 'Pet-Immune Motion', tagline: 'Perfect for pet owners', image: 'pmd75.png', badge: 'Pet Friendly', chooseIf: 'You have pets up to 40kg', features: [{ icon: Dog, label: 'Pets 40kg' }, { icon: Shield, label: 'No false' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.35 }} className="flex items-start gap-6 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center shadow-lg flex-shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">04 — Indoor Motion</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Eyes Inside</h2>
            <p className="text-sm text-muted-foreground">Detects movement in hallways, rooms & living areas.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {products.map((product, i) => (
            <motion.div key={product.model} initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.08, duration: 0.35 }}>
              <ComparisonCard product={product} index={i} isRecommended={i === 1} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function OutdoorMotionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  const products = [
    { model: 'PMD85', name: 'Outdoor Motion', tagline: 'Weatherproof perimeter detection', image: 'nvx80.png', badge: 'Best Seller', chooseIf: 'Standard garden/driveway coverage', features: [{ icon: Shield, label: 'IP65' }, { icon: Eye, label: '15m range' }] },
    { model: 'NV780MR', name: 'Long Range Outdoor', tagline: 'Extended range for large properties', image: 'nv780m.png', badge: 'Pro Grade', chooseIf: 'Large property or long driveway', features: [{ icon: Eye, label: '30m mirror' }, { icon: Shield, label: 'Anti-mask' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
      <motion.div style={{ scale }} className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={isInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary text-primary-foreground mb-4 shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">05 — Outdoor Motion</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Perimeter Defense</h2>
          <p className="text-sm text-muted-foreground">Know before intruders reach your door.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {products.map((product, i) => (
            <motion.div key={product.model} initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ delay: i * 0.08, duration: 0.35 }}>
              <ComparisonCard product={product} index={i} isRecommended={i === 0} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

function SirensSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    { model: 'SR230', name: 'Outdoor Siren', tagline: 'Loud alarm with blue strobe', image: 'outdoor-siren.png', badge: 'Recommended', features: [{ icon: Volume2, label: '110dB' }, { icon: Zap, label: 'Blue strobe' }, { icon: Shield, label: 'Weatherproof' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-xl">
            <Bell className="w-7 h-7" />
          </div>
          <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">06 — Sirens & Strobes</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">The Voice</h2>
          <p className="text-sm text-muted-foreground">Loud, bright, impossible to ignore.</p>
        </motion.div>
        <SingleProductCard product={products[0]} />
      </div>
    </motion.section>
  );
}

function DoorSensorsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    { model: 'DCT10', name: 'Door/Window Sensor', tagline: 'Standard range up to 40m', image: 'dct10.png', badge: 'Most Used', chooseIf: 'Standard home, panel nearby', features: [{ icon: Signal, label: '40m range' }, { icon: Battery, label: 'Long life' }] },
    { model: 'DCTXP2', name: 'Extended Range Sensor', tagline: 'For larger properties up to 70m', image: 'dct2.png', badge: 'Long Range', chooseIf: 'Large home or distant sensors', features: [{ icon: Signal, label: '70m range' }, { icon: Eye, label: 'Hidden' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ y: 24, opacity: 0 }} animate={isInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary text-primary-foreground mb-4 shadow-xl">
            <DoorOpen className="w-7 h-7" />
          </div>
          <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">07 — Door & Window</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Entry Protection</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Know instantly when any door or window opens.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {products.map((product, i) => (
            <motion.div key={product.model} initial={{ opacity: 0, x: i === 0 ? -40 : 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}>
              <ComparisonCard product={product} index={i} isRecommended={i === 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function LifeSafetySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    {
      model: 'SD360',
      name: 'Wireless Smoke Detector',
      tagline: 'Early fire detection integrated with your system',
      image: 'sd360.png',
      badge: 'Life Safety',
      features: [
        { icon: ThermometerSun, label: 'Photo sense' },
        { icon: Wifi, label: 'Wireless' },
        { icon: Bell, label: 'Triggers siren' },
      ],
    },
  ];

  return (
    <motion.section ref={ref} className="relative py-20 overflow-hidden bg-gradient-to-b from-error/5 via-background to-warning/10">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.35 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-error to-warning text-warning-foreground mb-4">
            <Flame className="w-7 h-7" />
          </div>
          <span className="block text-xs font-bold text-error uppercase tracking-widest mb-2">08 — Smoke & Heat</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Life Safety</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Early fire detection connected to your system.</p>
        </motion.div>
        <SingleProductCard product={products[0]} />
      </div>
    </motion.section>
  );
}

function ExtrasSection() {
  const ref = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const products = [
    { model: 'S250', name: 'Specialty Sensor', tagline: 'For unique detection needs', image: 'mg5050.png', features: [{ icon: Settings, label: 'Configurable' }, { icon: Cpu, label: 'Integrated' }] },
    { model: 'RPT', name: 'Wireless Repeater', tagline: "Extend your system's range", image: 'mg5075.png', badge: 'Range Booster', features: [{ icon: Signal, label: '2x range' }, { icon: Wifi, label: 'Boosts signal' }] },
  ];

  return (
    <motion.section ref={ref} className="relative py-16 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.35 }} className="max-w-2xl mx-auto">
          <motion.button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full group text-left"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-muted/50 via-background to-muted/50 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:border-secondary/30">
              <div className="flex items-center gap-4">
                <motion.div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted flex items-center justify-center shadow-inner" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <Settings className="w-6 h-6 text-muted-foreground" />
                </motion.div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">09 — Connectivity</span>
                  <h3 className="font-display text-xl font-bold text-foreground">Smart Extras</h3>
                  <p className="text-xs text-muted-foreground">Optional add-ons to expand your system</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">{isExpanded ? 'Click to hide' : 'Click to view products'}</span>
                <motion.div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center border border-border group-hover:border-secondary/30 transition-colors" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  {isExpanded ? <Minus className="w-5 h-5 text-secondary" /> : <Plus className="w-5 h-5 text-secondary" />}
                </motion.div>
              </div>
            </div>
          </motion.button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: 600 }}
                exit={{ opacity: 0, maxHeight: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-8 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {products.map((product, i) => (
                      <motion.div key={product.model} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}>
                      <ComparisonCard product={product} index={i} />
                    </motion.div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4 italic">ZX8SP, PS25, PS45 available as installer-grade add-ons</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function ProductCategories() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="categories" className="relative">
      <div ref={headerRef} className="py-16 md:py-20 text-center relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={isHeaderInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.35 }}>
            <motion.span initial={{ opacity: 0, scale: 0.96 }} animate={isHeaderInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.3 }} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-border shadow-md mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">9 Product Categories</span>
              <span className="text-lg" aria-hidden>🐷</span>
            </motion.span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need.{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Nothing You Don&apos;t.</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">Professional security made simple. Each category with unique products to explore.</p>
          </motion.div>
        </div>
      </div>

      <BrainSection />
      <KeypadsSection />
      <RemotesSection />
      <IndoorMotionSection />
      <OutdoorMotionSection />
      <SirensSection />
      <DoorSensorsSection />
      <LifeSafetySection />
      <ExtrasSection />

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.35 }} viewport={{ once: true }} className="py-20 text-center relative bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl mb-5">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to Protect Your Home?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Mix and match from any category. Our quote builder makes it simple.</p>
          <Link href="/paradox-magellan/calculator">
            <Button variant="hero" size="lg" className="gap-3 shadow-xl">
              <Heart className="w-5 h-5" />
              Start Building Your System
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
