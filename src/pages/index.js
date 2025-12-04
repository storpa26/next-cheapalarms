import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Camera,
  FileText,
  DollarSign,
  Users,
  Mail,
  Zap,
  Shield,
  Globe,
  AlertCircle,
  Smartphone,
  Cog,
  BarChart3,
  Package,
} from "lucide-react";

export default function TestingGuidePage() {
  const [copiedItem, setCopiedItem] = useState(null);
  const [checkedItems, setCheckedItems] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("testing-checklist");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const toggleCheckItem = (id) => {
    const newChecked = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newChecked);
    if (typeof window !== "undefined") {
      localStorage.setItem("testing-checklist", JSON.stringify(newChecked));
    }
  };

  const completionPercentage = () => {
    const total = 15; // Total checklist items
    const completed = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <>
      <Head>
        <title>Testing Guide • CheapAlarms Portal MVP</title>
        <meta
          name="description"
          content="Complete testing guide for the CheapAlarms headless customer portal MVP"
        />
      </Head>

      {/* Force light theme */}
      <div className="light min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 text-white">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="container relative mx-auto max-w-6xl px-6">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Zap className="h-4 w-4" />
                MVP Testing Guide
              </div>
              <h1 className="mb-4 text-5xl font-bold tracking-tight">
                CheapAlarms Portal
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
                Complete testing guide for the headless customer portal MVP.
                Test all features, workflows, and integrations.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
                >
                  <Shield className="h-5 w-5" />
                  Admin Panel
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Sign In
                </Link>
                <a
                  href="https://staging.cheapalarms.com.au/wp-json/ca/v1/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Globe className="h-5 w-5" />
                  API Health
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="border-b border-gray-200 bg-white py-8">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <LinkCard
                icon={<Globe />}
                title="Frontend (Vercel)"
                url="https://headless-cheapalarms.vercel.app"
              />
              <LinkCard
                icon={<Globe />}
                title="Backend (Plesk)"
                url="https://staging.cheapalarms.com.au/wp-json"
              />
              <LinkCard
                icon={<Shield />}
                title="Admin Dashboard"
                url="https://headless-cheapalarms.vercel.app/admin"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-6 py-12">
          {/* Progress Indicator */}
          <div className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Testing Progress
              </h3>
              <span className="text-2xl font-bold text-blue-600">
                {completionPercentage()}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${completionPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* System Overview */}
          <Section
            id="overview"
            icon={<Package />}
            title="System Overview"
            subtitle="MVP Features & Architecture"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FeatureCard
                icon={<Camera />}
                title="Photo Upload System"
                features={[
                  "Multi-photo upload per item",
                  "Mobile camera support",
                  "Auto-save & compression",
                  "HMAC-secured endpoints",
                ]}
              />
              <FeatureCard
                icon={<FileText />}
                title="Estimate Management"
                features={[
                  "View estimate details",
                  "Accept/Reject workflow",
                  "Photo-based revisions",
                  "Change history tracking",
                ]}
              />
              <FeatureCard
                icon={<Cog />}
                title="Admin Panel"
                features={[
                  "Review customer photos",
                  "Edit estimate items",
                  "Add discounts/surcharges",
                  "Send revision emails",
                ]}
              />
              <FeatureCard
                icon={<Zap />}
                title="GHL Integration"
                features={[
                  "Sync estimates & invoices",
                  "Create contacts",
                  "Generate invoices",
                  "Send notifications",
                ]}
              />
            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                <AlertCircle className="h-5 w-5" />
                Architecture
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Frontend:</strong> Next.js (Pages Router) on Vercel
                </p>
                <p>
                  <strong>Backend:</strong> WordPress + Custom Plugin on Plesk
                </p>
                <p>
                  <strong>Auth:</strong> JWT tokens with custom capabilities
                </p>
                <p>
                  <strong>CRM:</strong> GoHighLevel (GHL) API integration
                </p>
              </div>
            </div>
          </Section>

          {/* Customer Flow */}
          <Section
            id="customer-flow"
            icon={<Users />}
            title="Test Customer Flow"
            subtitle="Complete workflow from invitation to acceptance"
          >
            <TestStep
              number={1}
              title="Access Portal with Invite Token"
              description="Customer receives email with portal link"
              checked={checkedItems["customer-1"]}
              onToggle={() => toggleCheckItem("customer-1")}
            >
              <CodeBlock
                label="Sample Portal URL"
                code="https://headless-cheapalarms.vercel.app/portal?estimateId=ABC123&inviteToken=xyz789"
                onCopy={(text) => copyToClipboard(text, "customer-url")}
                copied={copiedItem === "customer-url"}
              />
            </TestStep>

            <TestStep
              number={2}
              title="View Estimate Details"
              description="Customer sees pricing, items, and business details"
              checked={checkedItems["customer-2"]}
              onToggle={() => toggleCheckItem("customer-2")}
            >
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Estimate summary with total</li>
                <li>✓ Line items with descriptions</li>
                <li>✓ Currency formatting (AUD)</li>
              </ul>
            </TestStep>

            <TestStep
              number={3}
              title="Upload Photos"
              description="Multi-photo upload with mobile camera support"
              checked={checkedItems["customer-3"]}
              onToggle={() => toggleCheckItem("customer-3")}
            >
              <div className="space-y-2">
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  <strong>Test:</strong> Upload 2-3 photos per item, try mobile
                  camera
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Drag & drop support</li>
                  <li>✓ Camera button (mobile)</li>
                  <li>✓ Auto-save on upload</li>
                  <li>✓ Compression (max 10MB)</li>
                </ul>
              </div>
            </TestStep>

            <TestStep
              number={4}
              title="Submit Photos"
              description="Photos locked after submission"
              checked={checkedItems["customer-4"]}
              onToggle={() => toggleCheckItem("customer-4")}
            >
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <strong>Expected:</strong> Green banner shows "Photos submitted"
                status
              </div>
            </TestStep>

            <TestStep
              number={5}
              title="View Revised Estimate (if adjusted)"
              description="See admin changes with savings highlighted"
              checked={checkedItems["customer-5"]}
              onToggle={() => toggleCheckItem("customer-5")}
            >
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Hero banner shows savings</li>
                <li>✓ Admin note displayed</li>
                <li>✓ Before/after pricing</li>
                <li>✓ Line-by-line changes</li>
              </ul>
            </TestStep>

            <TestStep
              number={6}
              title="Accept/Reject Estimate"
              description="Customer makes final decision"
              checked={checkedItems["customer-6"]}
              onToggle={() => toggleCheckItem("customer-6")}
            >
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                <strong>Test:</strong> Click "Accept Estimate" button
              </div>
            </TestStep>
          </Section>

          {/* Admin Flow */}
          <Section
            id="admin-flow"
            icon={<Shield />}
            title="Test Admin Flow"
            subtitle="Photo review and estimate adjustments"
          >
            <TestStep
              number={1}
              title="Login to Admin Panel"
              description="Use CheapAlarms Superadmin credentials"
              checked={checkedItems["admin-1"]}
              onToggle={() => toggleCheckItem("admin-1")}
            >
              <div className="space-y-3">
                <CredentialCard
                  title="Admin Credentials"
                  username="admin"
                  password="abcd@1234"
                  onCopyUsername={(text) =>
                    copyToClipboard(text, "admin-username")
                  }
                  onCopyPassword={(text) =>
                    copyToClipboard(text, "admin-password")
                  }
                  copiedUsername={copiedItem === "admin-username"}
                  copiedPassword={copiedItem === "admin-password"}
                />
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Login Now
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </TestStep>

            <TestStep
              number={2}
              title="View Estimates List"
              description="See all estimates with status filters"
              checked={checkedItems["admin-2"]}
              onToggle={() => toggleCheckItem("admin-2")}
            >
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Summary cards (Sent, Accepted, Declined)</li>
                <li>✓ Filter by status</li>
                <li>✓ Search by email/number</li>
              </ul>
            </TestStep>

            <TestStep
              number={3}
              title="Review Customer Photos"
              description="View submitted photos in sidebar"
              checked={checkedItems["admin-3"]}
              onToggle={() => toggleCheckItem("admin-3")}
            >
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <strong>Look for:</strong> Photo gallery grouped by item with
                lightbox
              </div>
            </TestStep>

            <TestStep
              number={4}
              title="Edit Estimate Based on Photos"
              description="Adjust quantities, add items, apply discounts"
              checked={checkedItems["admin-4"]}
              onToggle={() => toggleCheckItem("admin-4")}
            >
              <div className="space-y-2">
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  <strong>Test:</strong> Click "Edit Estimate" → Modify items →
                  Add admin note → Save
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Adjust item quantities</li>
                  <li>✓ Add custom items</li>
                  <li>✓ Apply discounts/surcharges</li>
                  <li>✓ Add admin notes</li>
                </ul>
              </div>
            </TestStep>

            <TestStep
              number={5}
              title="Send Revised Estimate"
              description="Customer receives notification email"
              checked={checkedItems["admin-5"]}
              onToggle={() => toggleCheckItem("admin-5")}
            >
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <strong>Email includes:</strong> Savings amount, admin note,
                portal link
              </div>
            </TestStep>

            <TestStep
              number={6}
              title="Create Invoice (After Acceptance)"
              description="Generate invoice in GHL"
              checked={checkedItems["admin-6"]}
              onToggle={() => toggleCheckItem("admin-6")}
            >
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                <strong>Test:</strong> Click "Create Invoice" button
              </div>
            </TestStep>
          </Section>

          {/* API Reference */}
          <Section
            id="api-reference"
            icon={<Zap />}
            title="API Endpoints"
            subtitle="Quick reference for testing"
          >
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900">
                      Endpoint
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900">
                      Method
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <APIRow
                    method="GET"
                    endpoint="/ca/v1/health"
                    description="API health check"
                    testable
                  />
                  <APIRow
                    method="POST"
                    endpoint="/ca/v1/auth/token"
                    description="Admin login (JWT)"
                  />
                  <APIRow
                    method="GET"
                    endpoint="/ca/v1/admin/estimates"
                    description="List all estimates"
                    protected
                  />
                  <APIRow
                    method="GET"
                    endpoint="/ca/v1/portal/status"
                    description="Customer portal status"
                  />
                  <APIRow
                    method="POST"
                    endpoint="/ca/v1/upload/start"
                    description="Initiate photo upload"
                  />
                  <APIRow
                    method="PUT"
                    endpoint="/ca/v1/estimate/update"
                    description="Update estimate items"
                    protected
                  />
                </tbody>
              </table>
            </div>
          </Section>

          {/* Features Checklist */}
          <Section
            id="features"
            icon={<CheckCircle2 />}
            title="MVP Features Checklist"
            subtitle="Mark features as tested"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ChecklistItem
                id="feature-1"
                label="Photo Upload (Multi-file)"
                checked={checkedItems["feature-1"]}
                onToggle={() => toggleCheckItem("feature-1")}
              />
              <ChecklistItem
                id="feature-2"
                label="Mobile Camera Support"
                checked={checkedItems["feature-2"]}
                onToggle={() => toggleCheckItem("feature-2")}
              />
              <ChecklistItem
                id="feature-3"
                label="Photo Compression"
                checked={checkedItems["feature-3"]}
                onToggle={() => toggleCheckItem("feature-3")}
              />
              <ChecklistItem
                id="feature-4"
                label="Estimate Viewing"
                checked={checkedItems["feature-4"]}
                onToggle={() => toggleCheckItem("feature-4")}
              />
              <ChecklistItem
                id="feature-5"
                label="Accept/Reject Workflow"
                checked={checkedItems["feature-5"]}
                onToggle={() => toggleCheckItem("feature-5")}
              />
              <ChecklistItem
                id="feature-6"
                label="Admin Photo Review"
                checked={checkedItems["feature-6"]}
                onToggle={() => toggleCheckItem("feature-6")}
              />
              <ChecklistItem
                id="feature-7"
                label="Estimate Revision Panel"
                checked={checkedItems["feature-7"]}
                onToggle={() => toggleCheckItem("feature-7")}
              />
              <ChecklistItem
                id="feature-8"
                label="Admin Notes"
                checked={checkedItems["feature-8"]}
                onToggle={() => toggleCheckItem("feature-8")}
              />
              <ChecklistItem
                id="feature-9"
                label="Revision Email Notifications"
                checked={checkedItems["feature-9"]}
                onToggle={() => toggleCheckItem("feature-9")}
              />
              <ChecklistItem
                id="feature-10"
                label="Savings Hero Banner"
                checked={checkedItems["feature-10"]}
                onToggle={() => toggleCheckItem("feature-10")}
              />
              <ChecklistItem
                id="feature-11"
                label="Change History Tracking"
                checked={checkedItems["feature-11"]}
                onToggle={() => toggleCheckItem("feature-11")}
              />
              <ChecklistItem
                id="feature-12"
                label="Invoice Creation"
                checked={checkedItems["feature-12"]}
                onToggle={() => toggleCheckItem("feature-12")}
              />
              <ChecklistItem
                id="feature-13"
                label="GHL Sync"
                checked={checkedItems["feature-13"]}
                onToggle={() => toggleCheckItem("feature-13")}
              />
              <ChecklistItem
                id="feature-14"
                label="JWT Authentication"
                checked={checkedItems["feature-14"]}
                onToggle={() => toggleCheckItem("feature-14")}
              />
              <ChecklistItem
                id="feature-15"
                label="CORS Security"
                checked={checkedItems["feature-15"]}
                onToggle={() => toggleCheckItem("feature-15")}
              />
            </div>
          </Section>

          {/* Troubleshooting */}
          <Section
            id="troubleshooting"
            icon={<AlertCircle />}
            title="Troubleshooting"
            subtitle="Common issues and solutions"
          >
            <div className="space-y-4">
              <TroubleshootCard
                issue="403 Forbidden on Admin Endpoints"
                solution="Log out and log back in with CheapAlarms Superadmin credentials. Ensure JWT token is in Authorization header."
              />
              <TroubleshootCard
                issue="Photos Not Uploading"
                solution="Check file size (max 10MB). Verify CORS origins in secrets.php include Vercel URL."
              />
              <TroubleshootCard
                issue="Estimate Not Syncing"
                solution="Check GHL credentials in secrets.php. Verify locationId is correct."
              />
              <TroubleshootCard
                issue="Email Not Sending"
                solution="Configure WP Mail SMTP plugin. Check WordPress email settings."
              />
            </div>
          </Section>

          {/* Footer */}
          <div className="mt-16 rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Check the{" "}
              <a
                href="https://staging.cheapalarms.com.au/wp-json"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                API docs
              </a>{" "}
              or review the{" "}
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                README.md
              </code>{" "}
              in the project root.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Component: Section
function Section({ id, icon, title, subtitle, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

// Component: LinkCard
function LinkCard({ icon, title, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="text-blue-600">{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{url}</div>
      </div>
      <ExternalLink className="h-4 w-4 text-gray-400" />
    </a>
  );
}

// Component: FeatureCard
function FeatureCard({ icon, title, features }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Component: TestStep
function TestStep({ number, title, description, checked, onToggle, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-bold transition ${
            checked
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-300 bg-white text-gray-600 hover:border-blue-500"
          }`}
        >
          {checked ? <Check className="h-5 w-5" /> : number}
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {children && <div className="ml-11 mt-3">{children}</div>}
    </div>
  );
}

// Component: CodeBlock
function CodeBlock({ label, code, onCopy, copied }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      {label && (
        <div className="mb-1 text-xs font-medium text-gray-500">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto text-xs text-gray-800">
          {code}
        </code>
        <button
          onClick={() => onCopy(code)}
          className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// Component: CredentialCard
function CredentialCard({
  title,
  username,
  password,
  onCopyUsername,
  onCopyPassword,
  copiedUsername,
  copiedPassword,
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">{title}</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-20 text-xs text-gray-500">Username:</span>
          <code className="flex-1 text-sm font-medium text-gray-900">
            {username}
          </code>
          <button
            onClick={() => onCopyUsername(username)}
            className="rounded p-1 text-gray-500 hover:bg-gray-200"
          >
            {copiedUsername ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-xs text-gray-500">Password:</span>
          <code className="flex-1 text-sm font-medium text-gray-900">
            {password}
          </code>
          <button
            onClick={() => onCopyPassword(password)}
            className="rounded p-1 text-gray-500 hover:bg-gray-200"
          >
            {copiedPassword ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Component: ChecklistItem
function ChecklistItem({ id, label, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition ${
        checked
          ? "border-green-500 bg-green-50"
          : "border-gray-200 bg-white hover:border-blue-300"
      }`}
    >
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded ${
          checked ? "bg-green-500" : "border-2 border-gray-300 bg-white"
        }`}
      >
        {checked && <Check className="h-4 w-4 text-white" />}
      </div>
      <span
        className={`text-sm font-medium ${
          checked ? "text-green-900" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// Component: APIRow
function APIRow({ method, endpoint, description, protected: isProtected, testable }) {
  const methodColors = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-orange-100 text-orange-700",
    DELETE: "bg-red-100 text-red-700",
  };

  const fullUrl = `https://staging.cheapalarms.com.au/wp-json${endpoint}`;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <code className="text-xs text-gray-700">{endpoint}</code>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded px-2 py-1 text-xs font-medium ${methodColors[method]}`}
        >
          {method}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        <div className="flex items-center gap-2">
          <span>{description}</span>
          {isProtected && (
            <span className="text-xs text-orange-600">(Auth required)</span>
          )}
          {testable && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

// Component: TroubleshootCard
function TroubleshootCard({ issue, solution }) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h4 className="mb-2 font-semibold text-orange-900">{issue}</h4>
      <p className="text-sm text-orange-800">{solution}</p>
    </div>
  );
}
