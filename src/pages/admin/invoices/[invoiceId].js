import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
import { InvoiceDetailContent } from "@/components/admin/InvoiceDetailContent";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { invoiceId } = router.query;
  const [locationId, setLocationId] = useState("");

  return (
    <>
      <Head>
        <title>Invoice #{invoiceId} • Admin</title>
      </Head>
      <AdminLayout title={`Invoice #${invoiceId}`}>
        <div className="mb-4">
          <Link
            href="/admin/invoices"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Invoices
          </Link>
        </div>
        <InvoiceDetailContent
          invoiceId={invoiceId}
          locationId={locationId || undefined}
        />
      </AdminLayout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/invoices"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

