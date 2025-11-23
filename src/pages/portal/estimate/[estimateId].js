import PortalPage from "../index";

export default function EstimatePortalPage(props) {
  // Use props from getInitialProps - they're available immediately from SSR
  // Don't use router.query here as it might not be ready yet
  return <PortalPage {...props} />;
}

// Re-export getInitialProps from parent
EstimatePortalPage.getInitialProps = async (ctx) => {
  // Extract estimateId from params
  const estimateId = Array.isArray(ctx.query.estimateId) 
    ? ctx.query.estimateId[0] 
    : ctx.query.estimateId;
  
  // Add estimateId to query so PortalPage.getInitialProps can use it
  ctx.query.estimateId = estimateId;
  
  return PortalPage.getInitialProps(ctx);
};

