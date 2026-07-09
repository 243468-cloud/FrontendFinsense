'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
 const { user } = useAuthStore();
 const router = useRouter();

 useEffect(() => {
 const timer = setTimeout(() => {
 if (!user) router.replace('/auth');
 }, 500);
 return () => clearTimeout(timer);
 }, [user, router]);

 if (!user) return null;
 return <>{children}</>;
}
