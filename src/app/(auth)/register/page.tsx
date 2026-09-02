"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Mail, Lock, User as UserIcon, Store, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [channel, setChannel] = useState<"PHONE" | "EMAIL">("PHONE");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const identifier = channel === "PHONE" ? phone : email;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          identifier,
          password,
          firstName,
          lastName,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please check your details.");
      }

      // Redirect to OTP verification page
      router.push(
        `/verify?identifier=${encodeURIComponent(data.identifier)}&channel=${channel}&purpose=SIGNUP`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            N
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            N<span className="text-emerald-600">Market</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Fast local commerce across Tamale & Northern Ghana
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-slate-200 sm:px-10">
          {/* Dual-Channel Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setChannel("PHONE");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition ${
                channel === "PHONE"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Ghana Mobile (SMS)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setChannel("EMAIL");
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition ${
                channel === "EMAIL"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email (Resend)</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Mohammed"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Fareed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>
            </div>

            {/* Identifier field */}
            {channel === "PHONE" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghanaian Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    🇬🇭
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You will receive a 6-digit SMS verification code.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You will receive a verification code sent via Resend.
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>
            </div>

            {/* Account Purpose / Role */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("CUSTOMER")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    role === "CUSTOMER"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <UserIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="text-[11px] font-bold leading-tight">
                    Customer
                    <span className="block font-normal text-[10px] text-slate-500">
                      Shop local goods
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    role === "SELLER"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Store className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="text-[11px] font-bold leading-tight">
                    Merchant
                    <span className="block font-normal text-[10px] text-slate-500">
                      Sell in Tamale
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
