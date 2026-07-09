'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden md:pb-0 pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
