import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function QuoteRequestSuccessPage() {
  const router = useRouter();
  const { estimateId, locationId } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Quote Request Submitted!
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've received your quote request and created your estimate. Check your email for the portal link and password setup instructions.
        </p>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What's next?</strong>
          </p>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the "Set Your Password" link in the email</li>
            <li>Create your password to access your portal</li>
            <li>View and manage your quote</li>
          </ol>
        </div>

        <div className="space-y-3">
          {estimateId && (
            <Link
              href={`/portal?estimateId=${estimateId}${locationId ? `&locationId=${locationId}` : ''}`}
              className="block w-full bg-primary text-white rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              View Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          
          <div className="flex gap-3">
            <Link
              href="/products/sample"
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl px-6 py-3 font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Request Another Quote
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl px-6 py-3 font-semibold hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <a href="mailto:support@cheapalarms.com.au" className="text-primary underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

