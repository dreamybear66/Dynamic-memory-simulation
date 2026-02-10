'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * PageFaultIndicator - Visual notification for page faults
 * Shows animated modal when page fault occurs with replacement details
 */
export default function PageFaultIndicator() {
    const pageFaultActive = usePagingStore(state => state.pageFaultActive);
    const lastPageFault = usePagingStore(state => state.lastPageFault);
    const replacementAlgo = usePagingStore(state => state.replacementAlgo);

    return (
        <AnimatePresence>
            {pageFaultActive && lastPageFault && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    {/* Backdrop Flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-500"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 20 }}
                        className="relative bg-black border-4 border-red-500 rounded-lg p-6 max-w-md pointer-events-auto
                            shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <AlertTriangle size={64} className="text-red-500" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-red-400 text-center mb-4 font-mono">
                            PAGE FAULT!
                        </h2>

                        {/* Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Page Number:</span>
                                <span className="text-white font-mono font-bold text-lg">
                                    {lastPageFault.pageNumber}
                                </span>
                            </div>

                            {lastPageFault.replacedPage !== null && (
                                <>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Replaced Page:</span>
                                        <span className="text-orange-400 font-mono font-bold text-lg">
                                            {lastPageFault.replacedPage}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Algorithm:</span>
                                        <span className="text-cyan-400 font-mono font-bold">
                                            {replacementAlgo}
                                        </span>
                                    </div>
                                </>
                            )}

                            {lastPageFault.replacedPage === null && (
                                <div className="text-center text-green-400 py-2">
                                    ✓ Free frame available - No replacement needed
                                </div>
                            )}
                        </div>

                        {/* Animation */}
                        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded flex items-center justify-center mb-1">
                                    <span className="font-mono font-bold text-red-400">
                                        {lastPageFault.replacedPage ?? '—'}
                                    </span>
                                </div>
                                <span className="text-gray-500">OUT</span>
                            </div>

                            <motion.div
                                animate={{ x: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <span className="text-2xl text-gray-600">→</span>
                            </motion.div>

                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500 rounded flex items-center justify-center mb-1">
                                    <span className="font-mono font-bold text-green-400">
                                        {lastPageFault.pageNumber}
                                    </span>
                                </div>
                                <span className="text-gray-500">IN</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
