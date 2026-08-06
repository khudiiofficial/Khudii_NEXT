import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from '@/lib/router-compat';
import { useAdminAuth } from '@/lib/admin-auth';
const APIPath = (process.env.NEXT_PUBLIC_BACKEND_PATH || '');
export default function AdminLogin() {
  const { setUser } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav=useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${APIPath}/auth/login`,
        { email, password },
        { withCredentials: true } // important for cookies
      );

    //   alert("Login successful!");
      setUser(res.data.user)
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{backgroundImage:'url(/Khudii_login_bg_logo.webp)',
      backgroundSize:'contain',
      backgroundRepeat:'no-repeat',
      backgroundPosition:'center'
    }} className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300">
      <div className="w-full max-w-md bg-[#cedcff]/90 hover:bg-[#cedcff]/100 shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-[#222222] mb-6">
          Admin Panel Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#222222] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={(email) ?? ''}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#222222] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={(password) ?? ''}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-2 px-4 bg-[#02236e] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
