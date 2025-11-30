import { createWpProxyHandler } from "@/lib/api/wp-proxy";

export default createWpProxyHandler((req) => {
  const { uuid } = req.query;
  if (!uuid) {
    throw new Error("Staff UUID is required");
  }
  return `/ca/v1/servicem8/staff/${encodeURIComponent(uuid)}`;
}, {
  allowedMethods: ["GET"],
  validate: (req) => {
    if (!req.query.uuid) {
      return { valid: false, status: 400, error: "Staff UUID is required" };
    }
    return { valid: true };
  },
});

