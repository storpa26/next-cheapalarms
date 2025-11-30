import { createWpProxyHandler } from "@/lib/api/wp-proxy";

export default createWpProxyHandler((req) => {
  const { uuid } = req.query;
  if (!uuid) {
    throw new Error("Job UUID is required");
  }
  return `/ca/v1/servicem8/jobs/${encodeURIComponent(uuid)}`;
}, {
  allowedMethods: ["GET", "DELETE"],
  validate: (req) => {
    if (!req.query.uuid) {
      return { valid: false, status: 400, error: "Job UUID is required" };
    }
    return { valid: true };
  },
});
