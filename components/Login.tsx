// app/auth/login/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithEmail, signInWithProvider, signUpWithEmail } from "@/lib/auth";
import { createClient } from "@/lib/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/try-on";

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Existing session found, redirecting to:", redirectedFrom);
          router.replace(redirectedFrom);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();
  }, [router, redirectedFrom]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      if (isSigningUp) {
        const data = await signUpWithEmail(email, password);
        console.log("Sign up response:", data);

        if (data.user && !data.session) {
          setError("Please check your email for verification link!");
        } else if (data.session) {
          // User is automatically signed in
          console.log("User signed up and logged in");
        }
      } else {
        const data = await signInWithEmail(email, password);
        console.log("Sign in response:", data);

        if (data.session) {
          console.log("✅ Sign in successful, session created");
          console.log("Redirecting to:", redirectedFrom);
          router.replace(redirectedFrom);
          return;
        } else if (data.user && !data.session) {
          setError("Please verify your email before signing in.");
        }
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      if (err instanceof Error) {
        // Handle specific error messages
        if (err.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Please verify your email before signing in.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);

    try {
      setLoading(true);
      console.log("Starting Google sign in...");
      await signInWithProvider("google", redirectedFrom);
      // The redirect will happen automatically via OAuth
    } catch (err: unknown) {
      console.error("Google auth error:", err);
      if (err instanceof Error) {
        setError("Google sign-in failed: " + err.message);
      } else {
        setError("Google sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{
      backgroundImage: `
        radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)
      `,
      backgroundSize: "8px 8px, 32px 32px, 32px 32px",
    }}>
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          {isSigningUp ? "Create Account" : "Welcome Back"}
        </h2>

        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring focus:ring-teal-500 focus:border-teal-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring focus:ring-teal-500 focus:border-teal-500 transition-colors"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white px-6 py-4 rounded-lg font-semibold cursor-pointer shadow-lg hover:shadow-xl transform transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed scale-95" : "hover:scale-105"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              isSigningUp ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className={`w-full cursor-pointer bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50 hover:scale-105"
            }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? "Processing..." : "Continue with Google"}
        </button>

        <button
          onClick={() => {
            setIsSigningUp(!isSigningUp);
            setError(null);
          }}
          className="mt-4 cursor-pointer text-sm text-gray-600 underline hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          {isSigningUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}