import Link from 'next/link';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-background">
                  CheapAlarms
                </span>
                <span className="text-xs text-background/60 block -mt-1">
                  .com.au
                </span>
              </div>
            </Link>
            <p className="text-background/60 text-sm max-w-sm mb-6">
              Professional-grade security systems made simple. Protect your home with equipment trusted by installers Australia-wide.
            </p>
            <div className="flex items-center gap-2 text-sm text-background/40">
              <span aria-hidden>🐷</span>
              <span>Your friendly security guide</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:1300000000" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                  <Phone className="w-4 h-4" />
                  1300 000 000
                </a>
              </li>
              <li>
                <a href="mailto:info@cheapalarms.com.au" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                  <Mail className="w-4 h-4" />
                  info@cheapalarms.com.au
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-background/60">
                  <MapPin className="w-4 h-4" />
                  Australia-wide
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-sm text-background/60 hover:text-background transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#categories" className="text-sm text-background/60 hover:text-background transition-colors">
                  Security Parts
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-background/60 hover:text-background transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/paradox-magellan/calculator" className="text-sm text-primary hover:opacity-90 transition-colors font-medium">
                  Quote Builder →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} CheapAlarms.com.au. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-background/40">
            <a href="#" className="hover:text-background/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-background/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
