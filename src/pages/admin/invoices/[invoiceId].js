import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { requireAdmin } from "../../../lib/auth/requireAdmin";
import { InvoiceDetailContent } from "../../../components/admin/InvoiceDetailContent";

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
            className="text-sm text-primary hover:text-primary-hover"
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

export async function getServerSideProps(ctx) {
  const authCheck = await requireAdmin(ctx, { notFound: true });
  if (authCheck.notFound || authCheck.redirect) {
    return authCheck;
  }
  return { props: { ...(authCheck.props || {}) } };
}

