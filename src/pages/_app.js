import "@/styles/globals.css";
import "@/styles/testing-guide.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/query-client";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Configure Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

function RouteProgressOverlay() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let timer = null;

    const handleStart = (url) => {
      if (url === router.asPath) return;
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => setPending(true), 120);
    };

    const handleComplete = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      setPending(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur">
      <div className="w-[320px] rounded-2xl border border-primary/30 bg-linear-to-br from-card via-background to-card px-8 py-6 text-center shadow-[0_30px_80px_-40px_rgba(201,83,117,0.9)]">
        <div className="flex justify-center">
          <Spinner size="xl" className="text-primary" />
        </div>
        <p className="mt-4 text-base font-semibold text-primary">
          Preparing…
        </p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <div className={poppins.variable}>
              <RouteProgressOverlay />
              <Component {...pageProps} />
              <Toaster />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

