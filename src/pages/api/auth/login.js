import { serialize } from "cookie";
import { authenticate, TOKEN_COOKIE } from "@/lib/wp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, err: "Method not allowed" });
  }

  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      err: "Username and password are required.",
    });
  }

  try {
    const result = await authenticate({ username, password });

    const cookie = serialize(TOKEN_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.expires_in ?? 3600,
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      ok: true,
      user: result.user,
      expiresAt: result.expires_at,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
      err: error instanceof Error ? error.message : "Authentication failed",
    });
  }
}

