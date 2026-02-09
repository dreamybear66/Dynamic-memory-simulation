'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';

interface SevenSegmentProps {
    value: string | number;
    label: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function SevenSegment({ value, label, color = 'text-cyan-400', size = 'md' }: SevenSegmentProps) {
    const formatted = String(value).padStart(2, '0');

    return (
        <div className="flex flex-col items-center bg-black/40 border border-gray-800 p-2 rounded-md shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
            <div className={clsx(
                "font-mono font-black tracking-widest leading-none drop-shadow-[0_0_5px_currentColor]",
                color,
                size === 'sm' ? "text-xl" : size === 'md' ? "text-3xl" : "text-5xl"
            )}>
                {formatted.split('').map((char, i) => (
                    <span key={i} className="inline-block relative">
                        {/* Ghost "8" background */}
                        <span className="absolute inset-0 opacity-10 blur-[1px]">8</span>
                        <motion.span
                            key={`${char}-${i}`}
                            initial={{ opacity: 0.5, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10"
                        >
                            {char}
                        </motion.span>
                    </span>
                ))}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">
                {label}
            </div>
        </div>
    );
}
