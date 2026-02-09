'use client';

import { motion } from 'framer-motion';
import { Maximize2, Minimize2, X } from 'lucide-react';
import clsx from 'clsx';

interface TerminalWindowProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    status?: 'active' | 'idle' | 'error' | 'scanning';
    hideControls?: boolean;
}

export default function TerminalWindow({ title, children, className, status = 'idle', hideControls = false }: TerminalWindowProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={clsx(
                "glass-panel rounded-lg overflow-hidden flex flex-col",
                className
            )}
        >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-charcoal/80 border-b border-cyan-900/50">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-2 h-2 rounded-full shadow-[0_0_5px]",
                        status === 'active' ? "bg-cyan-400 shadow-cyan-400" :
                            status === 'error' ? "bg-red-500 shadow-red-500" :
                                status === 'scanning' ? "bg-green-400 shadow-green-400 animate-pulse" :
                                    "bg-gray-500"
                    )} />
                    <h3 className="text-xs tracking-widest font-bold text-cyan-300 uppercase">{title}</h3>
                </div>

                {!hideControls && (
                    <div className="flex gap-2 text-cyan-700">
                        <Minimize2 size={14} className="cursor-pointer hover:text-cyan-400 transition-colors" />
                        <Maximize2 size={14} className="cursor-pointer hover:text-cyan-400 transition-colors" />
                        <X size={14} className="cursor-pointer hover:text-red-400 transition-colors" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 relative">
                {/* Grid Background Overlay for Content */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
