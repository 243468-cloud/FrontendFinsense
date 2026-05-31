'use client';
// Dashboard Layout — sidebar desktop + bottom nav mobile
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER } from '@/lib/mockData';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  // For demo: auto-login with mock user if not authenticated
  useEffect(() => {
    if (!user) {
      setUser(MOCK_USER);
    }
  }, [user, setUser]);

  return (
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar />

      {/* Main Content */}
      <main
        className="flex-1 min-h-screen pb-nav md:pb-0"
        id="main-content"
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
