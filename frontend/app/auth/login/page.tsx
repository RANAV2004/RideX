"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Car, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(form);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Car className="text-white" size={32} />
          <span className="text-white text-3xl font-bold">RideX</span>
        </div>
        <div>
          <h2 className="text-white text-5xl font-bold leading-tight mb-4">
            Go anywhere,<br />anytime.
          </h2>
          <p className="text-gray-400 text-lg">
            Request a ride, hop in, and go. Safe, reliable rides at your fingertips.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© 2024 RideX. All rights reserved.</p>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 rounded-l-3xl lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Car size={24} />
            <span className="text-2xl font-bold">RideX</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-black hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
