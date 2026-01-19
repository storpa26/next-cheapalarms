import { createWpProxyHandler } from "../../../../../lib/api/wp-proxy";

export default createWpProxyHandler((req) => {
  const { jobUuid } = req.query;
  if (!jobUuid) {
    throw new Error("Job UUID is required");
  }
  return `/ca/v1/servicem8/jobs/${encodeURIComponent(jobUuid)}/activities`;
}, {
  allowedMethods: ["GET"],
  validate: (req) => {
    if (!req.query.jobUuid) {
      return { valid: false, status: 400, error: "Job UUID is required" };
    }
    return { valid: true };
  },
});
