// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Settings } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Início", icon: Home },
        { href: "/cardapio", label: "Cardápio & Combos", icon: UtensilsCrossed },
        { href: "/admin", label: "Admin", icon: Settings },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-lg pointer-events-auto flex items-center gap-6"
            >
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "relative flex items-center gap-2 text-sm font-medium transition-colors duration-200",
                                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:block">{link.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </motion.div>
        </nav>
    );
}
