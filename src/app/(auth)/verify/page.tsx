"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, AlertCircle, Loader2, RefreshCw } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const identifier = searchParams.get("identifier") || "";
  const channel = searchParams.get("channel") || "PHONE";
  const purpose = searchParams.get("purpose") || "SIGNUP";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code, purpose }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Check your code.");
      }

      setSuccessMsg("Verified! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push(data.redirectTo || "/");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code.");
      }

      setSuccessMsg(data.message || "A new code has been sent!");
      setCountdown(60);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Verify your {channel === "PHONE" ? "Phone Number" : "Email"}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          We sent a 6-digit verification code to:
          <span className="block font-bold text-slate-800 text-sm mt-0.5">
            {identifier || "your account"}
          </span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                Enter 6-digit verification code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full tracking-[10px] text-center font-mono font-black text-2xl py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
              />
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Code expires in 10 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Activate Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Didn't receive the code?</span>
            {countdown > 0 ? (
              <span className="font-mono text-slate-400 font-semibold">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/register"
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
            >
              ← Change phone number or email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
