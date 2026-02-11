import PortalPage, { getServerSideProps as portalGetServerSideProps } from "../index";

export default function EstimatePortalPage(props) {
  return <PortalPage {...props} />;
}

export async function getServerSideProps(ctx) {
  // Ensure estimateId from the path is available in query (matching /portal?estimateId=X behavior)
  const estimateId = Array.isArray(ctx.query.estimateId)
    ? ctx.query.estimateId[0]
    : ctx.query.estimateId;

  ctx.query.estimateId = estimateId;

  return portalGetServerSideProps(ctx);
}
