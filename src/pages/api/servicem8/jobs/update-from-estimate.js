import { createWpProxyHandler } from "@/lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/servicem8/jobs/update-from-estimate", {
  allowedMethods: ["POST"],
});

