import { createWpProxyHandler } from "../../../lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/estimate", {
  allowedMethods: ["GET"],
  validate: (req) => {
    if (!req.query.estimateId) {
      return { valid: false, status: 400, error: "estimateId required" };
    }
    return { valid: true };
  },
});

