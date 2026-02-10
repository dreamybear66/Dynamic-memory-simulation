'use client';

import { useState, useRef } from 'react';
import { useAllocationStore } from '@/store/allocationStore';
import { usePagingStore } from '@/store/pagingStore';
import { motion } from 'framer-motion';
import { FileDown, FileText, PieChart, Activity, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function ReportsPage() {
    const allocationState = useAllocationStore();
    const pagingState = usePagingStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const allocationGraphRef = useRef<HTMLDivElement>(null);
    const pagingGraphRef = useRef<HTMLDivElement>(null);

    // --- Statistics Calculation ---

    // Allocation Stats
    const totalMemory = allocationState.totalMemory;
    const usedMemory = allocationState.memoryBlocks
        .filter(b => b.type === 'PROCESS')
        .reduce((acc, b) => acc + b.size, 0);
    const freeMemory = totalMemory - usedMemory;
    const utilization = ((usedMemory / totalMemory) * 100).toFixed(1);
    const fragmentation = allocationState.statsHistory.length > 0
        ? allocationState.statsHistory[allocationState.statsHistory.length - 1].externalFragmentation
        : 0;
    const processCount = allocationState.memoryBlocks.filter(b => b.type === 'PROCESS').length;

    // Prepare Allocation Graph Data
    const allocationGraphData = allocationState.statsHistory.map((stat, index) => ({
        name: `Step ${index}`,
        fragmentation: stat.externalFragmentation,
        processes: stat.processCount
    })).slice(-20); // Last 20 steps

    // Paging Stats
    const totalAccesses = pagingState.stats.totalAccesses;
    const pageFaults = pagingState.stats.pageFaults;
    const tlbHits = pagingState.stats.tlbHits;
    const faultRate = totalAccesses > 0 ? ((pageFaults / totalAccesses) * 100).toFixed(1) : '0.0';
    const hitRate = totalAccesses > 0 ? ((tlbHits / totalAccesses) * 100).toFixed(1) : '0.0';

    // Prepare Paging Graph Data (Mocking history if not available in store, assuming store has full history in future update)
    // Currently pagingStore has summary stats, let's use the stats object if it has history, otherwise we might need to mock or use what's available
    // The pagingStore interface shows 'pageFaultHistory' and 'tlbHitHistory', let's use those!
    const pagingGraphData = pagingState.stats.pageFaultHistory?.map((faults, index) => ({
        name: `Step ${index}`,
        faults: faults,
        hits: pagingState.stats.tlbHitHistory[index] || 0
    })).slice(-20) || [];

    // Last Operation Details
    const lastAllocationLog = allocationState.logs.length > 0 ? allocationState.logs[0] : "No allocation operations yet.";
    const lastPagingLog = pagingState.logs.length > 0 ? pagingState.logs[pagingState.logs.length - 1] : "No paging operations yet.";

    const generatePDF = async () => {
        setIsGenerating(true);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- PAGE 1: ALLOCATION ANALYSIS ---

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 150, 255);
        doc.text("AllocX Memory Simulation Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`System Uptime: 99.9% | Session ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 35);

        let currentY = 50;

        // Section Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("1. Memory Allocation Analysis", 14, currentY);
        currentY += 10;

        // Allocation Stats Table
        const allocationData = [
            ['Utilization', `${utilization}%`],
            ['External Fragmentation', `${fragmentation} KB`],
            ['Active Processes', `${processCount}`],
            ['Current Algorithm', `${allocationState.algorithm}`],
            ['Last Operation', lastAllocationLog]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Metric', 'Value']],
            body: allocationData,
            theme: 'grid',
            headStyles: { fillColor: [0, 150, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' } },
            margin: { left: 14, right: 14 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Allocation Graph
        if (allocationGraphRef.current) {
            try {
                const canvas = await html2canvas(allocationGraphRef.current, { scale: 2, backgroundColor: '#1a1a1a' } as any);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 180;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.setFontSize(12);
                doc.setTextColor(60);
                doc.text("Fragmentation Trend (Live Capture)", 14, currentY - 3);

                doc.addImage(imgData, 'PNG', 14, currentY, imgWidth, imgHeight);
            } catch (err) {
                console.error("Allocation graph capture failed", err);
            }
        }

        // --- PAGE 2: PAGING ANALYSIS ---
        doc.addPage();
        currentY = 20;

        // Section Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("2. Paging Simulation Analysis", 14, currentY);
        currentY += 10;

        // Paging Stats Table
        const pagingData = [
            ['Total Accesses', `${totalAccesses}`],
            ['Page Faults', `${pageFaults}`],
            ['Page Fault Rate', `${faultRate}%`],
            ['TLB Hits', `${tlbHits}`],
            ['TLB Hit Rate', `${hitRate}%`],
            ['Replacement Algorithm', `${pagingState.replacementAlgo}`],
            ['Last Operation', lastPagingLog]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Metric', 'Value']],
            body: pagingData,
            theme: 'grid',
            headStyles: { fillColor: [150, 0, 255], fontSize: 10 },
            bodyStyles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' } },
            margin: { left: 14, right: 14 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Paging Graph
        if (pagingGraphRef.current) {
            try {
                const canvas = await html2canvas(pagingGraphRef.current, { scale: 2, backgroundColor: '#1a1a1a' } as any);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 180;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.setFontSize(12);
                doc.setTextColor(60);
                doc.text("Page Fault History (Live Capture)", 14, currentY - 3);

                doc.addImage(imgData, 'PNG', 14, currentY, imgWidth, imgHeight);
            } catch (err) {
                console.error("Paging graph capture failed", err);
            }
        }

        // --- FOOTERS (All Pages) ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('AllocX Memory Simulator - Detailed Multi-Page Report', 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        }

        doc.save('AllocX_TheSim_Report.pdf');
        setIsGenerating(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                        COMPREHENSIVE ANALYSIS
                    </h1>
                    <p className="text-gray-400">Detailed performance metrics and history for all subsystems</p>
                </div>
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-bold text-white hover:from-red-500 hover:to-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <Activity className="animate-spin" size={20} />
                    ) : (
                        <FileDown size={20} />
                    )}
                    {isGenerating ? 'GENERATING REPORT...' : 'EXPORT FULL PDF'}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 gap-8">
                {/* 1. Allocation Analysis Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div
                        className="p-6 rounded-2xl"
                        style={{ backgroundColor: '#111827', borderColor: '#164e63', borderWidth: '1px', borderStyle: 'solid' }}
                    >
                        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottomColor: '#164e63', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#164e63' }}>
                                    <PieChart size={24} style={{ color: '#22d3ee' }} />
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: '#cffafe' }}>Allocation Subsystem</h2>
                            </div>
                            <span className="text-xs font-mono px-2 py-1 rounded border" style={{ color: '#22d3ee', backgroundColor: '#164e63', borderColor: '#155e75' }}>
                                {allocationState.algorithm}
                            </span>
                        </div>

                        {/* Last Operation Log */}
                        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#083344', borderColor: '#164e63' }}>
                            <h3 className="text-xs uppercase font-bold mb-2 flex items-center gap-2" style={{ color: '#06b6d4' }}>
                                <Clock size={12} /> Last Operation
                            </h3>
                            <p className="text-sm font-mono" style={{ color: '#d1d5db' }}>
                                {lastAllocationLog}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <StatBox label="Utilization" value={`${utilization}%`} color="text-cyan-400" />
                            <StatBox label="Fragmentation" value={`${fragmentation} KB`} color="text-red-400" />
                        </div>

                        {/* Allocation Graph */}
                        <div
                            className="p-4 rounded-xl border"
                            style={{ backgroundColor: '#000000', borderColor: '#1f2937' }}
                            ref={allocationGraphRef}
                        >
                            <h3 className="text-xs mb-4 ml-2" style={{ color: '#9ca3af' }}>Fragmentation Over Time (Live)</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={allocationGraphData}>
                                        <defs>
                                            <linearGradient id="colorFrag" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#666" fontSize={10} tick={false} />
                                        <YAxis stroke="#666" fontSize={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                            itemStyle={{ color: '#ef4444' }}
                                        />
                                        <Area type="monotone" dataKey="fragmentation" stroke="#ef4444" fillOpacity={1} fill="url(#colorFrag)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Paging Analysis Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div
                        className="p-6 rounded-2xl"
                        style={{ backgroundColor: '#111827', borderColor: '#581c87', borderWidth: '1px', borderStyle: 'solid' }}
                    >
                        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottomColor: '#581c87', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#581c87' }}>
                                    <Activity size={24} style={{ color: '#c084fc' }} />
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: '#f3e8ff' }}>Paging Subsystem</h2>
                            </div>
                            <span className="text-xs font-mono px-2 py-1 rounded border" style={{ color: '#c084fc', backgroundColor: '#581c87', borderColor: '#6b21a8' }}>
                                {pagingState.replacementAlgo}
                            </span>
                        </div>

                        {/* Last Operation Log */}
                        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#3b0764', borderColor: '#581c87' }}>
                            <h3 className="text-xs uppercase font-bold mb-2 flex items-center gap-2" style={{ color: '#d8b4fe' }}>
                                <Clock size={12} /> Last Access
                            </h3>
                            <p className="text-sm font-mono truncate" style={{ color: '#d1d5db' }}>
                                {lastPagingLog}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <StatBox label="Page Fault Rate" value={`${faultRate}%`} color={parseFloat(faultRate) > 50 ? "text-red-400" : "text-green-400"} />
                            <StatBox label="TLB Hit Rate" value={`${hitRate}%`} color="text-purple-400" />
                        </div>

                        {/* Paging Graph */}
                        <div
                            className="p-4 rounded-xl border"
                            style={{ backgroundColor: '#000000', borderColor: '#1f2937' }}
                            ref={pagingGraphRef}
                        >
                            <h3 className="text-xs mb-4 ml-2" style={{ color: '#9ca3af' }}>Page Faults History</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={pagingGraphData.length > 0 ? pagingGraphData : [{ name: 'Start', faults: 0 }]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#666" fontSize={10} tick={false} />
                                        <YAxis stroke="#666" fontSize={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                        />
                                        <Line type="step" dataKey="faults" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-900/50 flex items-start gap-4">
                <CheckCircle className="text-cyan-400 shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="text-cyan-400 font-bold mb-1">Live Multi-Context Reporting</h4>
                    <p className="text-sm text-cyan-200/70">
                        This report aggregates data from active simulation sessions. The charts above are captured in high-resolution when you export to PDF.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="p-3 bg-black/50 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-mono font-bold ${color}`}>{value}</div>
        </div>
    );
}
