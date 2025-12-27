import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { EstimateDetailContent } from "@/components/admin/EstimateDetailContent";

export default function EstimateDetailPage() {
  const router = useRouter();
  const { estimateId } = router.query;
  const [locationId, setLocationId] = useState("");

  return (
    <>
      <Head>
        <title>Estimate #{estimateId} • Admin</title>
      </Head>
      <AdminLayout title={`Estimate #${estimateId}`}>
        <div className="mb-4">
          <Link
            href="/admin/estimates"
            className="text-sm text-primary hover:text-primary-hover"
          >
            ← Back to Estimates
          </Link>
        </div>
        <EstimateDetailContent
          estimateId={estimateId}
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

