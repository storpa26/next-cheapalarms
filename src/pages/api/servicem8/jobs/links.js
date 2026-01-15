import { createWpProxyHandler } from "../../../../lib/api/wp-proxy";

export default createWpProxyHandler((req) => {
  const { estimateId, jobUuid } = req.query;
  if (estimateId) {
    return `/ca/v1/servicem8/jobs/links?estimateId=${encodeURIComponent(estimateId)}`;
  }
  if (jobUuid) {
    return `/ca/v1/servicem8/jobs/links?jobUuid=${encodeURIComponent(jobUuid)}`;
  }
  throw new Error("estimateId or jobUuid is required");
}, {
  allowedMethods: ["GET"],
  validate: (req) => {
    if (!req.query.estimateId && !req.query.jobUuid) {
      return { valid: false, status: 400, error: "estimateId or jobUuid is required" };
    }
    return { valid: true };
  },
});
