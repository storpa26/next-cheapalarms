import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TOKEN_COOKIE } from "@/lib/wp";

export default function SetPasswordPage() {
  const router = useRouter();
  const { key, login, estimateId } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      // Ensure we have key and login from query params
      const resetKey = Array.isArray(key) ? key[0] : key;
      const userLogin = Array.isArray(login) ? login[0] : login;
      const estId = Array.isArray(estimateId) ? estimateId[0] : estimateId;

      if (!resetKey || !userLogin) {
        throw new Error("Missing reset key or login. Please use the link from your email.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: resetKey, 
          login: userLogin, 
          password,
          estimateId: estId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.err || json.error || "Failed to reset password");
      }

      // Store token in cookie
      if (json.token) {
        document.cookie = `${TOKEN_COOKIE}=${json.token}; path=/; max-age=${json.expiresIn || 3600}; SameSite=Lax`;
        localStorage.setItem('auth_token', json.token);
      }

      // Redirect to portal
      if (estId) {
        router.push(`/portal?estimateId=${estId}`);
      } else {
        router.push("/portal");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setLoading(false);
    }
  };

  // Wait for router to be ready before checking query params
  if (!router.isReady) {
    return (
      <>
        <Head>
          <title>Set Your Password - CheapAlarms</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Extract query params (handle array case)
  const resetKey = Array.isArray(key) ? key[0] : key;
  const userLogin = Array.isArray(login) ? login[0] : login;

  if (!resetKey || !userLogin) {
    return (
      <>
        <Head>
          <title>Set Your Password - CheapAlarms</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
            <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
            <button 
              onClick={() => router.push("/portal")} 
              className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all"
              style={{ backgroundColor: '#c95375' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b34563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#c95375'}
            >
              Go to Portal
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Set Your Password - CheapAlarms</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
            <p className="text-gray-600">Create a secure password for your CheapAlarms portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                placeholder="At least 8 characters"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                placeholder="Confirm your password"
                disabled={loading}
                required
                minLength={8}
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: '#c95375' }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#b34563';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#c95375';
              }}
              disabled={loading}
            >
              {loading ? "Setting Password..." : "Set Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
