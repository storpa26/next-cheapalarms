import { createWpProxyHandler } from "@/lib/api/wp-proxy";

export default createWpProxyHandler("/ca/v1/portal/invite-ghl-contact", {
  allowedMethods: ["POST"],
});

