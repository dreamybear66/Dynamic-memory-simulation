'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Memory/Scheduler Page - Redirects to Paging Simulation
 * The scheduler functionality has been removed as per project requirements
 */
export default function MemoryPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to paging simulation
        router.push('/dashboard/paging');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <div className="text-xl text-cyan-400 font-mono mb-2">
                    Redirecting to Paging Simulation...
                </div>
                <div className="text-sm text-gray-500">
                    Scheduler section has been removed
                </div>
            </div>
        </div>
    );
}
