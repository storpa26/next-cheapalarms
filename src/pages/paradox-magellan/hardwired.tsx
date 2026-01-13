"use client";

import { Cable, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

const ParadoxHardwiredContact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <Link 
            href="/paradox-magellan" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magellan
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-wolf/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Cable className="w-10 h-10 text-wolf" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hardwired Systems Need a Personal Touch
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Hardwired security installations are unique to each property. The wiring runs, 
              sensor positions, and equipment needed all depend on your building's layout. 
              We'd need to see your space to give you an accurate quote.
            </p>

            <div className="bg-muted rounded-xl p-8 mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Here's what happens next:
              </h2>
              <ul className="text-left text-muted-foreground space-y-3 max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>You get in touch and tell us about your property</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>We arrange a free site visit at a time that suits you</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-secondary/20 text-secondary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>We provide a detailed, no-obligation quote</span>
                </li>
              </ul>
            </div>

            {/* Contact options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send an Enquiry
              </Button>
            </div>

            {/* Alternative */}
            <p className="mt-8 text-muted-foreground">
              Prefer wireless? <Link href="/paradox-magellan/calculator" className="text-secondary hover:underline">Try our quote calculator</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} CheapAlarms</p>
        </div>
      </footer>
    </div>
  );
};

export default ParadoxHardwiredContact;
