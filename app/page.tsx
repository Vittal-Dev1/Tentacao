// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UploadCloud } from "lucide-react";

export default function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Painel Tentação";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6"
          >
            <UploadCloud className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {appName}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Gerencie as imagens do cardápio e combos sazonais para campanhas e WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="group relative inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium transition-all duration-200"
          >
            <LogIn className="w-4 h-4 mr-2" />
            <span>Fazer Login</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-[11px] text-slate-500">
            Acesso restrito à equipe Tentação.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
