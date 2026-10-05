"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Car, User, Mail, Lock, Phone, Truck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    role: "rider",
    vehicle: { make: "", model: "", year: "", licensePlate: "", color: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.role === "driver" && step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        vehicle: form.role === "driver" ? { ...form.vehicle, year: parseInt(form.vehicle.year) } : undefined,
      };
      const { data } = await authAPI.register(payload);
      setToken(data.token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Car className="text-white" size={32} />
          <span className="text-white text-3xl font-bold">RideX</span>
        </div>
        <div>
          <h2 className="text-white text-5xl font-bold leading-tight mb-4">
            Join RideX<br />today.
          </h2>
          <p className="text-gray-400 text-lg">
            Sign up as a rider to book rides, or as a driver to earn money on your schedule.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© 2024 RideX. All rights reserved.</p>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 rounded-l-3xl">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-gray-500 mb-6">
            {step === 1 ? "Enter your details below" : "Tell us about your vehicle"}
          </p>

          {/* Role selector */}
          {step === 1 && (
            <div className="flex gap-3 mb-6">
              {["rider", "driver"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold capitalize transition-all flex items-center justify-center gap-2 ${
                    form.role === r ? "border-black bg-black text-white" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {r === "rider" ? <User size={18} /> : <Truck size={18} />}
                  {r}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Full name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field pl-10" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="Email address" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field pl-10" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" placeholder="Password (min 6 chars)" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pl-10" required minLength={6} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" placeholder="Phone number" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field pl-10" />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">Vehicle Information</p>
                {[
                  { key: "make", placeholder: "Make (e.g. Toyota)" },
                  { key: "model", placeholder: "Model (e.g. Camry)" },
                  { key: "year", placeholder: "Year (e.g. 2020)", type: "number" },
                  { key: "licensePlate", placeholder: "License Plate" },
                  { key: "color", placeholder: "Color" },
                ].map(({ key, placeholder, type }) => (
                  <input key={key} type={type || "text"} placeholder={placeholder}
                    value={(form.vehicle as any)[key]}
                    onChange={(e) => setForm({ ...form, vehicle: { ...form.vehicle, [key]: e.target.value } })}
                    className="input-field" required />
                ))}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Creating account..." : step === 1 && form.role === "driver" ? "Next: Vehicle Info →" : "Create Account"}
            </button>

            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full">
                ← Back
              </button>
            )}
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-black hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
