// app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectTo = searchParams.get("redirectTo") || "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, redirectTo }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Erro ao fazer login.");
      } else {
        router.push(data?.redirectTo || "/admin");
      }
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
        <p className="text-slate-400 text-sm">
          Digite a senha para acessar o painel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Senha de acesso
          </label>
          <input
            type="password"
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
