import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Menu, X, Shield, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#categories', label: 'Security Parts' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-border shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-foreground">
                CheapAlarms
              </span>
              <span className="text-xs text-muted-foreground block -mt-1">
                .com.au
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <Phone className="w-4 h-4" />
              Talk to an Installer
            </Button>
            <Link href="/paradox-magellan/calculator">
              <Button variant="hero" size="default">
                Start Quote Builder
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 400 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Talk to an Installer
                </Button>
                <Link href="/paradox-magellan/calculator" className="w-full">
                  <Button variant="hero" className="w-full">
                    Start Quote Builder
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
