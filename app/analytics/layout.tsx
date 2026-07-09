'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
 return (
 <AuthGuard>
 <div className="flex min-h-screen bg-surface-2">
 <Sidebar />
 <main className="flex-1 min-w-0 min-h-screen pb-nav md:pb-0" id="main-content">
 {children}
 </main>
 <BottomNav />
 </div>
 </AuthGuard>
 );
}
