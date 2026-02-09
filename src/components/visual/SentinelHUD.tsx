'use client';

import { useSentinelStore } from '@/store/sentinelStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function SentinelHUD() {
    const { status, leaks, purgeLeaks, toggleAutoFix, autoFix } = useSentinelStore();

    const isAlert = status === 'ALERT' || status === 'PURGING';

    return (
        <AnimatePresence>
            {isAlert && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    className="fixed right-0 top-20 bottom-20 w-80 bg-red-900/90 border-l-4 border-red-500 backdrop-blur-md z-50 shadow-[-10px_0_30px_rgba(239,68,68,0.5)] flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 bg-red-950/50 border-b border-red-500/30 flex items-center gap-3">
                        <AlertTriangle className="text-red-500 animate-pulse" size={24} />
                        <div>
                            <h2 className="text-lg font-black text-white tracking-widest">CRITICAL ALERT</h2>
                            <div className="text-[10px] text-red-300 font-mono">MEMORY_LEAK_DETECTED</div>
                        </div>
                    </div>

                    {/* Leak List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaks.map((leak, i) => (
                            <motion.div
                                key={`${leak.blockId}-${i}`}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-black/40 border border-red-500/50 p-2 rounded flex justify-between items-center"
                            >
                                <div>
                                    <div className="text-red-400 font-bold text-xs">SECTOR {leak.blockId.substring(0, 8)}...</div>
                                    <div className="text-[10px] text-gray-400">Owner: PID {leak.pid} (orphaned)</div>
                                </div>
                                <div className="text-red-500 font-mono font-bold text-xs">
                                    {leak.size}KB
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-black/50 border-t border-red-500/30 space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span>TOTAL LEAKED:</span>
                            <span className="text-red-500 font-bold text-lg">
                                {leaks.reduce((acc, l) => acc + l.size, 0)} KB
                            </span>
                        </div>

                        <button
                            onClick={purgeLeaks}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={18} /> FORCE PURGE
                        </button>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-400">AUTO-CORRECTION</span>
                            <button
                                onClick={toggleAutoFix}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoFix ? 'bg-green-500' : 'bg-gray-700'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 bg-white rounded-full shadow-md"
                                    animate={{ x: autoFix ? 24 : 0 }}
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
