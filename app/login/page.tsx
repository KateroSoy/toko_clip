"use client";

import { ChangeEvent, FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Tidak dapat terhubung ke server TokoClip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <a className="brand login-brand" href="/">TokoClip<span>.</span></a>
        <div className="login-card">
          <p className="section-kicker">CUSTOMER ACCESS</p>
          <h1 className="login-title">Masuk ke TokoClip.</h1>
          <p className="login-copy">Gunakan akun pelanggan yang diberikan oleh admin TokoClip.</p>

          <form onSubmit={login} className="login-form">
            <label>
              <span>Username</span>
              <input
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="tokoclip001"
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
            </label>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" disabled={loading}>{loading ? "Memeriksa..." : "Masuk"}</button>
          </form>
        </div>
        <p className="login-foot">100 akun customer • session aman via HttpOnly cookie</p>
      </section>
    </main>
  );
}
