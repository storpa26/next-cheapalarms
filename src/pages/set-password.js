import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOKEN_COOKIE } from "@/lib/wp";

export default function SetPasswordPage() {
  const router = useRouter();
  const { key, login, estimateId } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Validate reset key on mount (non-blocking)
  useEffect(() => {
    if (!key || !login) {
      setValidating(false);
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    const validateKey = async () => {
      try {
        // Decode URL parameters in case they're encoded
        // Use try-catch in case they're already decoded
        let decodedKey = key;
        let decodedLogin = login;
        try {
          decodedKey = decodeURIComponent(key);
          decodedLogin = decodeURIComponent(login);
        } catch {
          // Already decoded, use as-is
        }
        
        const res = await fetch("/api/auth/validate-reset-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: decodedKey, login: decodedLogin }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          setUserEmail(json.user?.email || "");
        }
        // Don't set error if validation fails - let them try to submit anyway
        // The real validation happens on form submission
        setValidating(false);
      } catch (err) {
        // Silently fail - don't block the user
        // They can still try to submit the form
        setValidating(false);
      }
    };

    validateKey();
  }, [key, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Decode URL parameters before sending
      // Use try-catch in case they're already decoded
      let decodedKey = key;
      let decodedLogin = login;
      try {
        decodedKey = decodeURIComponent(key);
        decodedLogin = decodeURIComponent(login);
      } catch {
        // Already decoded, use as-is
      }
      
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: decodedKey, 
          login: decodedLogin, 
          password,
          estimateId: estimateId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.err || json.error || "Failed to reset password");
      }

      // Store token in cookie
      if (json.token) {
        document.cookie = `${TOKEN_COOKIE}=${json.token}; path=/; max-age=${json.expiresIn || 3600}; SameSite=Lax`;
      }

      // Redirect to portal/photos section with estimate
      if (estimateId) {
        router.push(`/portal?estimateId=${estimateId}#photos`);
      } else {
        router.push("/portal");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <>
        <Head>
          <title>Set Your Password - CheapAlarms</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Validating reset link...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error && !key && !login) {
    return (
      <>
        <Head>
          <title>Set Your Password - CheapAlarms</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invalid Link</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/portal")} className="w-full">
                Go to Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Set Your Password - CheapAlarms</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set Your Password</CardTitle>
            <CardDescription>
              {userEmail ? `Enter a new password for ${userEmail}` : "Enter a new password for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="At least 8 characters"
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting Password..." : "Set Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

