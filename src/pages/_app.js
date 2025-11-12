import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/components/ui/use-toast";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}

