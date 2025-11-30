import { proxyToWordPress } from "@/lib/api/wp-proxy";

export default async function handler(req, res) {
  const { id } = req.query;
  const wpPath = `/ca/v1/products/${encodeURIComponent(id)}`;
  return proxyToWordPress(req, res, wpPath, {
    allowedMethods: ["GET", "DELETE"],
  });
}


