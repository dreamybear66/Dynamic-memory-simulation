'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MemoryStick, Layers, BookOpen, FileText } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { name: 'ALLOCATION', path: '/dashboard/allocation', icon: Layers },
    { name: 'PAGING SIM', path: '/dashboard/paging', icon: Layers },
    { name: 'REPORTS', path: '/dashboard/reports', icon: FileText },
    { name: 'DOCS', path: '/dashboard/docs', icon: BookOpen },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 h-screen bg-black/80 border-r border-cyan-900/50 flex flex-col backdrop-blur-md fixed left-0 top-0 z-40"
        >
            {/* Brand */}
            <div className="p-6 border-b border-cyan-900/50">
                <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    AllocX_TheSim
                </h1>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition-all group relative overflow-hidden hover:bg-cyan-900/20",
                                isActive ? "text-cyan-400 bg-cyan-900/30 border border-cyan-500/50" : "text-gray-400 border border-transparent"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-cyan-400/10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <Icon size={18} className={clsx(isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300")} />
                            <span className="relative z-10">{item.name}</span>

                            {isActive && (
                                <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_5px_#00f2ff]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Status */}
            <div className="p-4 border-t border-cyan-900/50 text-[10px] text-gray-600 font-mono">
                <div className="flex justify-between items-center mb-1">
                    <span>AllocX Simulator</span>
                    <span className="text-cyan-500">ONLINE</span>
                </div>
            </div>
        </motion.aside>
    );
}
