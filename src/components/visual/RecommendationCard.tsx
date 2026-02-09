'use client';

import { useAIStore } from '@/store/aiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, AlertTriangle, Cpu } from 'lucide-react';
import clsx from 'clsx';

export default function RecommendationCard() {
    const { recommendation, applyRecommendation, status } = useAIStore();

    if (!recommendation) return null;

    const isHighConfidence = recommendation.confidence > 85;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                className="relative overflow-hidden group"
            >
                {/* Glitch Overlay */}
                <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 mix-blend-overlay pointer-events-none animate-pulse" />

                <div className="w-full bg-black/80 border border-yellow-500/50 rounded-lg p-6 flex flex-col gap-4 backdrop-blur-xl relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                <AlertTriangle size={16} />
                                <span className="text-xs font-bold tracking-widest uppercase">Optimization Detected</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter">
                                {recommendation.algorithm.replace('_', ' ')}
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                            <div className={clsx(
                                "text-3xl font-mono font-bold",
                                isHighConfidence ? "text-green-400" : "text-yellow-400"
                            )}>
                                {recommendation.confidence}%
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${recommendation.confidence}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className={clsx(
                                "h-full",
                                isHighConfidence ? "bg-green-500" : "bg-yellow-500"
                            )}
                        />
                    </div>

                    {/* Reasoning */}
                    <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded text-sm text-gray-300 font-mono leading-relaxed">
                        <span className="text-yellow-500 mr-2">»</span>
                        {recommendation.reasoning}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={applyRecommendation}
                        disabled={status === 'IDLE'} // Disable if already applied/reset
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-sm rounded flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    >
                        {status === 'IDLE' ? (
                            <><Check size={18} /> Optimization Applied</>
                        ) : (
                            <><Zap size={18} /> Auto-Apply Config</>
                        )}
                    </button>

                    <div className="text-[9px] text-center text-gray-600 font-mono mt-2">
                        AEGIS_ENGINE_V9 // HEURISTIC_ID: {recommendation.id}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
