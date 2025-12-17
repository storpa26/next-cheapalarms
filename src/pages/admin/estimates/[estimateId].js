import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { isAuthenticated, getLoginRedirect } from "@/lib/auth";
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

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return {
      redirect: {
        destination: getLoginRedirect("/admin/estimates"),
        permanent: false,
      },
    };
  }

  return { props: {} };
}

