// app/admin/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileImage,
  Check,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Category = "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE";

type MediaItem = {
  id: string;
  category: Category;
  description?: string;
  image_url: string;
  created_at: string;
};

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category>("CARDAPIO");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // List State
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/media?limit=50", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error("Erro ao buscar itens", error);
    } finally {
      setLoadingItems(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!file) {
      setFeedback({
        type: "error",
        message: "Selecione uma imagem para enviar.",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data?.message || "Erro ao enviar imagem. Tente novamente.",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Imagem enviada com sucesso!",
        });
        setFile(null);
        setDescription("");
        fetchItems(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "Erro inesperado ao enviar imagem.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      } else {
        alert("Erro ao excluir imagem.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir imagem.");
    }
  }

  function startEditing(item: MediaItem) {
    setEditingId(item.id);
    setEditDescription(item.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDescription("");
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescription }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchItems();
      } else {
        alert("Erro ao atualizar descrição.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar descrição.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center gap-12 relative overflow-hidden pt-24">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white">Upload de Imagens</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie o conteúdo visual do cardápio e combos.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Categoria
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(["CARDAPIO", "COMBO_DIA", "COMBO_TARDE"] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={twMerge(
                        "px-2 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border",
                        category === cat
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      {cat === "CARDAPIO"
                        ? "Cardápio"
                        : cat === "COMBO_DIA"
                          ? "Combo do Dia"
                          : "Combo da Tarde"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Imagem
              </label>
              <div
                className={twMerge(
                  "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer group",
                  dragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50",
                  file ? "border-emerald-500/50 bg-emerald-500/5" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-200">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-slate-300">
                          Clique para selecionar ou arraste aqui
                        </p>
                        <p className="text-xs text-slate-500">
                          JPG ou PNG (Recomendado: &lt; 2MB)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Descrição (opcional)
              </label>
              <textarea
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Promoção válida até sexta-feira..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar Imagem</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Feedback Messages */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={twMerge(
                  "p-4 rounded-xl flex items-start gap-3 text-sm",
                  feedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
              >
                {feedback.type === "success" ? (
                  <Check className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <p>{feedback.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Image List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl w-full space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Imagens Enviadas</h2>
          <button
            onClick={fetchItems}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loadingItems ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden group"
              >
                <div className="aspect-video relative bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => startEditing(item)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors"
                      title="Editar descrição"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
                      title="Excluir imagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-medium text-white">
                    {item.category === "CARDAPIO"
                      ? "Cardápio"
                      : item.category === "COMBO_DIA"
                        ? "Dia"
                        : "Tarde"}
                  </div>
                </div>
                <div className="p-4">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="Nova descrição..."
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300 truncate">
                      {item.description || (
                        <span className="text-slate-600 italic">
                          Sem descrição
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhuma imagem encontrada.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
