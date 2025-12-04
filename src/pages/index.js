import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  Calculator,
  Shield,
  Users,
  Globe,
  Copy,
  Check,
  ExternalLink,
  LogIn,
  FileText,
  Image,
  DollarSign,
  Zap,
} from "lucide-react";

export default function TestingHub() {
  const [copied, setCopied] = useState(false);

  const copyCredentials = () => {
    navigator.clipboard.writeText("admin / abcd@1234");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Testing Hub • CheapAlarms Portal</title>
        <meta
          name="description"
          content="Quick access to customer & admin testing workflows"
        />
      </Head>

      <div className="light min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <header className="border-b border-gray-200 bg-white/80 py-8 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl px-6 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Testing Hub
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              CheapAlarms Portal MVP
            </h1>
            <p className="text-gray-600">
              Quick access to customer & admin workflows
            </p>
          </div>
        </header>

        {/* Main Content - Two Columns */}
        <main className="container mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Customer Side */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition hover:shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Testing
                  </h2>
                  <span className="text-sm text-gray-500">Public Access</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/products/sample"
                  className="group flex items-center gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4 transition hover:border-primary hover:bg-primary/10"
                >
                  <Calculator className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Try Calculator
                    </div>
                    <div className="text-xs text-gray-500">
                      Build a custom quote
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-primary" />
                </Link>

                <Link
                  href="/login"
                  className="group flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition hover:border-primary/50 hover:bg-gray-50"
                >
                  <LogIn className="h-5 w-5 flex-shrink-0 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Portal Login
                    </div>
                    <div className="text-xs text-gray-500">
                      Access your estimates
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-primary" />
                </Link>

                <Link
                  href="/portal"
                  className="group flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition hover:border-primary/50 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 flex-shrink-0 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Customer Portal
                    </div>
                    <div className="text-xs text-gray-500">
                      View estimates & upload photos
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-primary" />
                </Link>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Customer Journey:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">1.</span> Get quote via
                    calculator
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">2.</span> Upload site photos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">3.</span> Receive adjusted
                    estimate
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">4.</span> Accept & get
                    invoice
                  </li>
                </ul>
              </div>
            </div>

            {/* Admin Side */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition hover:shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Admin Testing
                  </h2>
                  <span className="text-sm text-gray-500">Auth Required</span>
                </div>
              </div>

              {/* Credentials */}
              <div className="mb-6 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Test Credentials
                  </span>
                  <button
                    onClick={copyCredentials}
                    className="rounded-md p-1.5 text-gray-500 transition hover:bg-secondary/10 hover:text-secondary"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <code className="block text-sm font-mono text-gray-900">
                  admin / abcd@1234
                </code>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin"
                  className="group flex items-center gap-3 rounded-lg border-2 border-secondary/20 bg-secondary/5 p-4 transition hover:border-secondary hover:bg-secondary/10"
                >
                  <Shield className="h-5 w-5 flex-shrink-0 text-secondary" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Admin Login
                    </div>
                    <div className="text-xs text-gray-500">
                      Access admin panel
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-secondary" />
                </Link>

                <Link
                  href="/admin/estimates"
                  className="group flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition hover:border-secondary/50 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 flex-shrink-0 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Estimates Dashboard
                    </div>
                    <div className="text-xs text-gray-500">
                      View & manage estimates
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-secondary" />
                </Link>

                <Link
                  href="/admin/invoices"
                  className="group flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition hover:border-secondary/50 hover:bg-gray-50"
                >
                  <DollarSign className="h-5 w-5 flex-shrink-0 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Invoices
                    </div>
                    <div className="text-xs text-gray-500">
                      Manage invoices & payments
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-secondary" />
                </Link>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Admin Workflow:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">1.</span> Review customer
                    photos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">2.</span> Adjust estimate
                    pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">3.</span> Send revision
                    notification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">4.</span> Create invoice
                    on acceptance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <a
                  href="https://staging.cheapalarms.com.au/wp-json/ca/v1/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                >
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  API Health
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <a
                  href="https://staging.cheapalarms.com.au/wp-json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                  Backend API
                </a>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Frontend:</span>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                    Vercel
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Backend:</span>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                    Plesk
                  </code>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
