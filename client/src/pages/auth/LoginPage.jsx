import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(
        form.email,
        form.password,
        form.role || undefined
      );
      toast.success("Welcome back!");

      const from = location.state?.from?.pathname;
      navigate(
        from ||
          (user.role === "admin"
            ? "/admin"
            : user.role === "tailor"
            ? "/tailor/dashboard"
            : "/customer")
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-white">

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4 tracking-wide">
            ✂ Stitchify
          </h1>
          <p className="text-lg opacity-80 leading-relaxed">
            Your trusted on-demand tailoring platform. Quality stitching,
            delivered with precision and style.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Verified expert tailors",
              "Easy booking & scheduling",
              "Trusted ratings & reviews",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="text-green-300 font-bold">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">

          <h2 className="text-3xl font-semibold mb-2 text-white">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-gray-300 mb-6">
            Sign in to continue your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="text-sm text-gray-300">
                Role (optional)
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="">Auto-detect</option>
                <option value="customer">Customer</option>
                <option value="tailor">Tailor / Partner</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-all font-semibold shadow-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center text-sm text-gray-300">
            No account?{" "}
            <Link
              to="/signup"
              className="text-pink-400 font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
