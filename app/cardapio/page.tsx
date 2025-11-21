// app/cardapio/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ImageIcon } from "lucide-react";
import { clsx } from "clsx";

type MediaItem = {
    id: string;
    category: "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE";
    description?: string;
    image_url: string;
    created_at: string;
};

export default function CardapioPage() {
    const [activeTab, setActiveTab] = useState<"CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE">("CARDAPIO");
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItems() {
            setLoading(true);
            try {
                const res = await fetch(`/api/media?category=${activeTab.toLowerCase()}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to fetch items", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, [activeTab]);

    const tabs = [
        { id: "CARDAPIO", label: "Cardápio Completo" },
        { id: "COMBO_DIA", label: "Combo do Dia" },
        { id: "COMBO_TARDE", label: "Combo da Tarde" },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Nossas Delícias
                    </h1>
                    <p className="text-slate-400">
                        Confira nosso cardápio e as promoções especiais de hoje.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                activeTab === tab.id
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300"
                                        >
                                            <div className="aspect-[4/5] relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.image_url}
                                                    alt={item.description || "Imagem do cardápio"}
                                                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            {item.description && (
                                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <p className="text-sm text-white font-medium bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-500 space-y-4">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>Nenhuma imagem disponível nesta categoria.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
