'use client';

import { useAIStore } from '@/store/aiStore';
import { useRef, useEffect } from 'react';
import TerminalWindow from './TerminalWindow';

export default function AILogTerminal() {
    const { logs, status } = useAIStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <TerminalWindow
            title="NEURAL_LOG_FEED"
            className="w-full h-full"
            status={status === 'ANALYZING' ? 'scanning' : status === 'RECOMMENDING' ? 'active' : 'idle'}
        >
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto px-2 font-mono text-[10px] space-y-1 custom-scrollbar"
            >
                {logs.map((log, i) => (
                    <div key={i} className="border-l-2 border-transparent pl-2 hover:border-cyan-500/50 hover:bg-white/5 transition-colors">
                        <span className="text-gray-600 mr-2">
                            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className={
                            log.includes('WARNING') ? 'text-red-400 font-bold' :
                                log.includes('ANALYSIS') ? 'text-yellow-400' :
                                    log.includes('RECOMMENDATION') ? 'text-green-400 font-bold' :
                                        'text-cyan-400'
                        }>
                            {log}
                        </span>
                    </div>
                ))}

                {status === 'ANALYZING' && (
                    <div className="animate-pulse text-yellow-500 pl-2">_Scanning sectors...</div>
                )}
            </div>
        </TerminalWindow>
    );
}
