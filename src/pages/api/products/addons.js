import { createWpProxyHandler } from "../../../lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/products/addons", {
  allowedMethods: ["GET"],
});


