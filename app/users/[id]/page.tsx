'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Award, Zap, Shield, Flame, Sparkles, PiggyBank, Trophy, MessageCircle, Crown, CalendarDays, Medal } from 'lucide-react';
import { PageTransition, itemVariants, containerVariants } from '@/components/layout/PageTransition';
import { getPublicProfile, PublicUserProfile } from '@/services/userService';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Helper for formatting badge names
function formatBadgeName(badge: string) {
  return badge
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper component to render Lucide icons based on badge name
function BadgeIcon({ badge, className }: { badge: string, className?: string }) {
  const lower = badge.toLowerCase();
  if (lower.includes('ahorrador') || lower.includes('saver')) return <PiggyBank className={className} />;
  if (lower.includes('racha') || lower.includes('streak')) return <Flame className={className} />;
  if (lower.includes('liga') || lower.includes('league')) return <Trophy className={className} />;
  if (lower.includes('social')) return <MessageCircle className={className} />;
  if (lower.includes('boss') || lower.includes('master')) return <Crown className={className} />;
  if (lower.includes('subscription')) return <CalendarDays className={className} />;
  return <Medal className={className} />;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicProfile(params.id)
      .then(setProfile)
      .catch(() => {
        // Handle error e.g. user not found
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-surface-3 rounded-full flex items-center justify-center mb-4">
          <Award size={32} className="text-text-secondary/50" />
        </div>
        <p className="font-syne font-bold text-xl text-text-primary mb-2">Usuario no encontrado</p>
        <button onClick={() => router.back()} className="text-primary font-dm text-sm hover:underline">Volver a la búsqueda</button>
      </div>
    );
  }

  let badges = profile.userXp?.badges || [];
  if (typeof badges === 'string') {
    try { badges = JSON.parse(badges); } catch (e) { badges = []; }
  }

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 shadow-sm flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-surface hover:bg-surface-3 border border-border transition-all shadow-sm">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="font-syne font-bold text-lg text-text-primary flex-1">Perfil de Usuario</h1>
      </header>

      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-10 pb-8 px-4 flex flex-col items-center text-center z-10"
      >
        <div className="relative mb-5 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[5px] border-surface bg-surface overflow-hidden relative shadow-xl z-10">
            {profile.avatar ? (
              profile.avatar.startsWith('http') || profile.avatar.startsWith('/') || profile.avatar.startsWith('data:') ? (
                <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center font-syne text-5xl">
                  {profile.avatar}
                </div>
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-syne font-bold text-4xl text-primary">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg border-2 border-surface z-20 flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles size={12} />
            NIVEL {profile.userXp?.level || 1}
          </div>
        </div>

        <h2 className="font-syne font-bold text-3xl text-text-primary mb-1.5 tracking-tight">{profile.name}</h2>
        <p className="font-dm text-sm text-text-secondary flex items-center justify-center gap-1.5 bg-surface px-3 py-1 rounded-full border border-border shadow-sm">
          <MapPin size={14} className="text-primary" /> {profile.city}
        </p>
      </motion.div>

      <div className="max-w-lg mx-auto p-4 space-y-5 relative z-10">
        {/* Stats Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4"
        >
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 mb-3 shadow-inner border border-orange-500/20">
              <Flame size={24} className="text-orange-500" />
            </div>
            <p className="font-dm text-[11px] text-text-secondary uppercase tracking-wider font-bold mb-1">Racha Actual</p>
            <p className="font-mono font-black text-2xl text-text-primary">{profile.streak?.currentStreak || 0} <span className="text-sm font-dm text-text-secondary font-medium">días</span></p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-5 rounded-3xl shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 mb-3 shadow-inner border border-blue-500/20">
              <Zap size={24} className="text-blue-500" />
            </div>
            <p className="font-dm text-[11px] text-text-secondary uppercase tracking-wider font-bold mb-1">Experiencia</p>
            <p className="font-mono font-black text-2xl text-text-primary">{profile.userXp?.totalXp || 0} <span className="text-sm font-dm text-text-secondary font-medium">XP</span></p>
          </motion.div>
        </motion.div>

        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Shield size={20} className="text-primary" />
            </div>
            <h3 className="font-syne font-bold text-lg text-text-primary">Vitrina de Insignias</h3>
          </div>
          
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
              {badges.map((badge: string, idx: number) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-surface-2 p-4 rounded-2xl flex flex-col items-center text-center gap-3 border border-border/60 hover:border-primary/30 transition-all shadow-sm group"
                >
                  <div className="w-14 h-14 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-md border border-border/50 group-hover:shadow-primary/20 transition-shadow">
                    <BadgeIcon badge={badge} className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-dm text-xs font-bold text-text-primary leading-snug">
                    {formatBadgeName(badge)}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-border rounded-2xl bg-surface-2/50 relative z-10">
              <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Award size={28} className="text-text-secondary/40" />
              </div>
              <p className="font-dm font-bold text-sm text-text-primary mb-1">Aún no tiene insignias</p>
              <p className="font-dm text-xs text-text-secondary">Este usuario está apenas comenzando su aventura.</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
