import { serialize } from "cookie";
import { TOKEN_COOKIE } from "@/lib/wp";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  const cookie = serialize(TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}

