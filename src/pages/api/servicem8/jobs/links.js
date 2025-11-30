import { createWpProxyHandler } from "@/lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/servicem8/jobs/links", {
  allowedMethods: ["GET"],
});

