import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TOKEN_COOKIE } from "@/lib/wp";
import { Check, X, Lock, Eye, EyeOff } from "lucide-react";

// Password strength calculator
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };
  
  if (checks.length) score += 20;
  if (password.length >= 12) score += 10;
  if (checks.number) score += 20;
  if (checks.special) score += 20;
  if (checks.uppercase) score += 15;
  if (checks.lowercase) score += 15;
  
  let label = "Weak";
  let color = "#ef4444";
  if (score >= 80) {
    label = "Strong";
    color = "#10b981";
  } else if (score >= 50) {
    label = "Medium";
    color = "#f59e0b";
  }
  
  return { score, label, color, checks };
};

export default function SetPasswordPage() {
  const router = useRouter();
  const { key, login, estimateId } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const passwordStrength = calculatePasswordStrength(password);

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
        <div className="flex min-h-screen items-center justify-center bg-[#f7f8fd] p-4 relative overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <Card className="w-full max-w-md shadow-2xl border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center animate-pulse">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <p className="text-center text-gray-600">Validating reset link...</p>
              </div>
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
        <div className="flex min-h-screen items-center justify-center bg-[#f7f8fd] p-4 relative overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <Card className="w-full max-w-md shadow-2xl border-gray-200">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900">Invalid Link</CardTitle>
              <CardDescription className="text-gray-600 pt-2">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                onClick={() => router.push("/portal")} 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Portal
              </button>
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fd] p-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-gray-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">Set Your Password</CardTitle>
            <CardDescription className="text-gray-600 pt-2">
              {userEmail ? `Create a secure password for ${userEmail}` : "Create a secure password for your CheapAlarms portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              
              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
                    placeholder="At least 8 characters"
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Password strength:</span>
                      <span className="font-semibold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ 
                          width: `${passwordStrength.score}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Requirements Checklist */}
                {password && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-gray-700">Requirements:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.length ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.length ? "text-green-700" : "text-gray-500"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.number ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.number ? "text-green-700" : "text-gray-500"}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.special ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={passwordStrength.checks.special ? "text-green-700" : "text-gray-500"}>
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading || password !== confirmPassword || !passwordStrength.checks.length}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting Password...
                  </span>
                ) : (
                  "Set Password & Continue"
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

