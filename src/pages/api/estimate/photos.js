import { createWpProxyHandler } from "../../../lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/estimate/photos", {
  allowedMethods: ["GET", "POST"],
  validate: (req) => {
    if (req.method === "GET" && !req.query.estimateId) {
      return { valid: false, status: 400, error: "estimateId required" };
    }
    return { valid: true };
  },
});

