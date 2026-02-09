'use client';

import { motion } from 'framer-motion';
import { useAIStore } from '@/store/aiStore';
import clsx from 'clsx';

export default function AICore() {
    const { status } = useAIStore();

    const isIdle = status === 'IDLE';
    const isAnalyzing = status === 'ANALYZING';
    const isRecommending = status === 'RECOMMENDING';

    // Color Logic
    const coreColor = isAnalyzing ? '#fbbf24' : (isRecommending ? '#10b981' : '#3b82f6'); // Gold / Green / Blue
    const glowColor = isAnalyzing ? 'rgba(251, 191, 36, 0.5)' : (isRecommending ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.5)');

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Glow */}
            <motion.div
                animate={{
                    boxShadow: [`0 0 20px ${glowColor}`, `0 0 60px ${glowColor}`, `0 0 20px ${glowColor}`],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full opacity-30 blur-xl"
            />

            {/* Inner Core Sphere */}
            <motion.div
                className="w-32 h-32 rounded-full z-10 flex items-center justify-center backdrop-blur-md bg-white/5 border border-white/20 relative"
                animate={{
                    scale: isAnalyzing ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: isAnalyzing ? Infinity : 0 }}
                style={{ borderColor: coreColor }}
            >
                <div className="text-4xl font-black text-white mix-blend-overlay">AI</div>

                {/* Internal Data Streams */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
                    <motion.div
                        className="w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </motion.div>

            {/* Outer Rings */}
            {[1, 2, 3].map((ring, i) => (
                <motion.div
                    key={ring}
                    className="absolute rounded-full border border-dashed"
                    style={{
                        width: `${100 + ring * 40}%`,
                        height: `${100 + ring * 40}%`,
                        borderColor: coreColor,
                        opacity: 0.3
                    }}
                    animate={{
                        rotate: i % 2 === 0 ? 360 : -360,
                        scale: isAnalyzing ? [1, 1.05, 1] : 1
                    }}
                    transition={{
                        rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.5, repeat: Infinity, delay: i * 0.1 }
                    }}
                />
            ))}

            {/* Particles (Only when Analyzing) */}
            {isAnalyzing && (
                <>
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{ top: '50%', left: '50%' }}
                            animate={{
                                x: Math.cos(i * 45 * (Math.PI / 180)) * 120,
                                y: Math.sin(i * 45 * (Math.PI / 180)) * 120,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </>
            )}

            {/* Status Label */}
            <div className="absolute -bottom-12 text-xs font-mono font-bold tracking-[0.2em]" style={{ color: coreColor }}>
                STATUS: {status}
            </div>
        </div>
    );
}
