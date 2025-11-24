import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { parse as parseCookie } from "cookie";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TOKEN_COOKIE } from "@/lib/wp";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.err ?? "Login failed");
      }

      // Redirect to return URL or default to admin
      const returnUrl = router.query.from || "/admin";
      router.push(returnUrl);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign in • CheapAlarms</title>
      </Head>
      <main className="relative flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/10"
        >
          <header className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.35rem] text-muted-foreground">
              CheapAlarms
            </p>
            <h1 className="text-2xl font-semibold">Sign in to continue</h1>
          </header>

          {error && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Username</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const cookieHeader = req?.headers?.cookie ?? "";
  const cookies = parseCookie(cookieHeader);
  if (cookies[TOKEN_COOKIE]) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

