/**
 * LoginBackground Component
 * Animated 3D gradient background with floating orbs for login page
 */

export function LoginBackground() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-gradient-mesh" />
        
        {/* Floating 3D Orbs - Responsive sizes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full blur-3xl animate-float-2" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-float-3" />
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradient-mesh {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, 40px) scale(1.15);
          }
        }
        
        @keyframes float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(25px, -25px) scale(1.05);
          }
        }
        
        .animate-gradient-mesh {
          animation: gradient-mesh 15s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-float-1 {
          animation: float-1 20s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 25s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 18s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

