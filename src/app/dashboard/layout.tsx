import Sidebar from '@/components/layout/Sidebar';
import BackgroundWrapper from '@/components/visual/BackgroundWrapper';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-cyan-500/30">
            {/* Persistent Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <BackgroundWrapper />
            </div>

            {/* Navigation */}
            <Sidebar />

            {/* Global HUD Header (Status Bar described in prompt) */}
            <div className="fixed top-0 left-64 right-0 h-12 bg-black/50 backdrop-blur-sm border-b border-cyan-900/50 z-30 flex items-center justify-between px-6">
                <div className="flex gap-6 text-[10px] font-mono text-cyan-600">
                    {/* Elements removed as per request */}
                    <span className="font-bold tracking-widest text-cyan-500">DASHBOARD_V1</span>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 mt-12 p-6 overflow-y-auto relative z-10 w-full h-[calc(100vh-3rem)]">
                {children}
            </main>
        </div>
    );
}
