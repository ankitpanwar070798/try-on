"use client";


import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";


function AuthCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/try-on";

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing auth callback...");
        const supabase = createClient();

        let session = null;
        let retries = 0;

        // 🔄 Retry for up to 3 seconds
        while (!session && retries < 6) {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Auth callback error:", error);
            setError(error.message);
            setTimeout(() => {
              router.replace(
                "/auth/login?error=" + encodeURIComponent(error.message)
              );
            }, 2000);
            return;
          }

          session = data?.session;

          if (!session) {
            console.log("No session yet, retrying...");
            retries++;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (session) {
          console.log("Session found, redirecting to:", next);
          router.replace(next);
        } else {
          console.log("No session after retries");
          setTimeout(() => {
            router.replace("/auth/login");
          }, 1000);
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setError("An unexpected error occurred");
        setTimeout(() => {
          router.replace("/auth/login");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [router, next]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-red-600">Authentication failed: {error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting back to login...
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Completing sign-in...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we redirect you
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackPageInner />
    </Suspense>
  );
}
