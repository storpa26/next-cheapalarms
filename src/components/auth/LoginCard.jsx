/**
 * LoginCard Component
 * Glassmorphism card container for login form
 */

import { Shield } from "lucide-react";

export function LoginCard({ children }) {
  return (
    <div className="relative z-10 w-full max-w-md animate-fade-in-up px-4 sm:px-0">
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/20 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/10 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/20 hover:-translate-y-1">
        {/* Gradient border glow */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-20 blur-sm -z-10" />
        
        {/* Branding Section */}
        <header className="mb-6 sm:mb-8 text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary p-2.5 sm:p-3 shadow-lg shadow-primary/30 mb-1 sm:mb-2">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CheapAlarms
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Secure Access Portal
            </p>
          </div>
        </header>

        {/* Form Content */}
        {children}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

