'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Check, X } from 'lucide-react';

/**
 * PageTablePanel - Displays the complete page table with all bits
 * Shows page-to-frame mappings, valid/invalid status, and reference/dirty bits
 */
export default function PageTablePanel() {
    const pageTable = usePagingStore(state => state.pageTable);
    const config = usePagingStore(state => state.config);
    const currentTranslation = usePagingStore(state => state.currentTranslation);

    // Get current page being accessed
    const currentPage = currentTranslation.logicalAddress !== null
        ? currentTranslation.logicalAddress >> config.offsetBits
        : null;

    // Convert to array and sort by page number
    const entries = Object.entries(pageTable)
        .map(([page, entry]) => ({ page: parseInt(page), ...entry }))
        .sort((a, b) => a.page - b.page);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Page Table
                </h3>
                <div className="text-[10px] text-gray-500">
                    {entries.filter(e => e.valid).length}/{config.numPages} Pages Loaded
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-[10px] font-mono">
                    <thead className="sticky top-0 bg-black/90 backdrop-blur-sm">
                        <tr className="border-b border-cyan-900/50">
                            <th className="text-left py-2 px-2 text-gray-400">Page#</th>
                            <th className="text-left py-2 px-2 text-gray-400">Frame#</th>
                            <th className="text-center py-2 px-2 text-gray-400">Valid</th>
                            <th className="text-center py-2 px-2 text-gray-400">Ref</th>
                            <th className="text-center py-2 px-2 text-gray-400">Dirty</th>
                            <th className="text-left py-2 px-2 text-gray-400">PID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => {
                            const isActive = entry.page === currentPage;

                            return (
                                <motion.tr
                                    key={entry.page}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        backgroundColor: isActive
                                            ? 'rgba(6, 182, 212, 0.1)'
                                            : 'transparent'
                                    }}
                                    transition={{ delay: entry.page * 0.01 }}
                                    className={clsx(
                                        "border-b border-gray-800/50 transition-colors",
                                        isActive && "ring-1 ring-cyan-500/50"
                                    )}
                                >
                                    {/* Page Number */}
                                    <td className="py-2 px-2">
                                        <span className={clsx(
                                            "font-bold",
                                            entry.valid ? "text-cyan-400" : "text-gray-600"
                                        )}>
                                            {entry.page}
                                        </span>
                                    </td>

                                    {/* Frame Number */}
                                    <td className="py-2 px-2">
                                        {entry.valid && entry.frameNumber !== null ? (
                                            <span className="text-green-400 font-bold">
                                                {entry.frameNumber}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600">—</span>
                                        )}
                                    </td>

                                    {/* Valid Bit */}
                                    <td className="py-2 px-2 text-center">
                                        {entry.valid ? (
                                            <Check size={12} className="inline text-green-400" />
                                        ) : (
                                            <X size={12} className="inline text-red-500/50" />
                                        )}
                                    </td>

                                    {/* Reference Bit */}
                                    <td className="py-2 px-2 text-center">
                                        {entry.referenced ? (
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto"></div>
                                        ) : (
                                            <div className="w-2 h-2 bg-gray-700 rounded-full mx-auto"></div>
                                        )}
                                    </td>

                                    {/* Dirty Bit */}
                                    <td className="py-2 px-2 text-center">
                                        {entry.dirty ? (
                                            <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto"></div>
                                        ) : (
                                            <div className="w-2 h-2 bg-gray-700 rounded-full mx-auto"></div>
                                        )}
                                    </td>

                                    {/* Process ID */}
                                    <td className="py-2 px-2">
                                        {entry.pid !== null ? (
                                            <span className="text-purple-400">{entry.pid}</span>
                                        ) : (
                                            <span className="text-gray-600">—</span>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800 text-[9px] flex-wrap">
                <div className="flex items-center gap-1">
                    <Check size={10} className="text-green-400" />
                    <span className="text-gray-400">Valid</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-400">Referenced</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-400">Dirty</span>
                </div>
            </div>
        </div>
    );
}
