'use client';
// AchievementBadge — insignia con bounce + glow al desbloquear + hologram + tooltip
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { cn, getIconForEmoji } from '@/lib/utils';
import type { Achievement } from '@/types/goal.types';
import React, { useState } from 'react';

interface AchievementBadgeProps {
 achievement: Achievement;
 unlocked: boolean;
 size?: 'sm' | 'md' | 'lg';
 className?: string;
 onUnlock?: () => void;
}

const sizeMap = {
 sm: { container: 'w-14 h-14', iconSize: 22, lock: 12 },
 md: { container: 'w-20 h-20', iconSize: 32, lock: 16 },
 lg: { container: 'w-24 h-24', iconSize: 40, lock: 20 },
};

export function AchievementBadge({
 achievement,
 unlocked,
 size = 'md',
 className,
}: AchievementBadgeProps) {
 const sizes = sizeMap[size];
 const [isHovered, setIsHovered] = useState(false);

 // For 3D Tilt effect
 const x = useMotionValue(0);
 const y = useMotionValue(0);

 const rotateX = useTransform(y, [-100, 100], [15, -15]);
 const rotateY = useTransform(x, [-100, 100], [-15, 15]);

 function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
 const rect = event.currentTarget.getBoundingClientRect();
 x.set(event.clientX - rect.left - rect.width / 2);
 y.set(event.clientY - rect.top - rect.height / 2);
 }

 function handleMouseLeave() {
 x.set(0);
 y.set(0);
 setIsHovered(false);
 }

 return (
 <motion.div
 className={cn('relative flex flex-col items-center gap-1.5 group', className)}
 initial={unlocked ? { scale: 0.8, opacity: 0 } : {}}
 animate={unlocked ? { scale: 1, opacity: 1 } : {}}
 transition={{ type: 'spring', stiffness: 300, damping: 15 }}
 style={{ perspective: 1000 }}
 >
 <motion.div
 className={cn(
 'relative rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden',
 sizes.container,
 unlocked
 ? 'bg-gradient-to-br from-surface-2 to-surface-3 border z-10'
 : 'bg-surface-2 border border-border grayscale'
 )}
 onMouseMove={handleMouse}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={handleMouseLeave}
 style={
 unlocked
 ? {
 rotateX: isHovered ? rotateX : 0,
 rotateY: isHovered ? rotateY : 0,
 borderColor: achievement.color ? `${achievement.color}40` : 'rgba(0, 87, 255, 0.2)',
 boxShadow: achievement.color ? `0 4px 20px ${achievement.color}33` : '0 4px 20px rgba(0, 87, 255, 0.15)',
 }
 : {}
 }
 whileHover={unlocked ? { scale: 1.1 } : {}}
 animate={
 unlocked && !isHovered
 ? {
 boxShadow: [
 achievement.color ? `0 4px 20px ${achievement.color}33` : '0 4px 20px rgba(0, 87, 255, 0.15)',
 achievement.color ? `0 4px 30px ${achievement.color}66` : '0 4px 30px rgba(0, 87, 255, 0.35)',
 achievement.color ? `0 4px 20px ${achievement.color}33` : '0 4px 20px rgba(0, 87, 255, 0.15)',
 ],
 }
 : {}
 }
 transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
 role="img"
 aria-label={unlocked ? achievement.title : `${achievement.title} (bloqueado)`}
 >
 {/* Holographic Shimmer Effect */}
 {unlocked && (
 <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
 <div 
 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
 style={{
 background: `linear-gradient(105deg, transparent 20%, ${achievement.color ? achievement.color + '33' : 'rgba(255,255,255,0.3)'} 25%, transparent 30%)`,
 backgroundSize: '200% 200%',
 animation: isHovered ? 'shimmer 1.5s infinite linear' : 'none',
 }}
 />
 </div>
 )}

 <div className="z-10 flex items-center justify-center">
 {(() => {
 const Icon = getIconForEmoji(achievement.emoji);
 return (
   <Icon 
     size={sizes.iconSize} 
     className={unlocked ? '' : 'text-text-secondary grayscale opacity-30'} 
     style={unlocked ? { color: achievement.color || '#1A66FF', filter: isHovered ? `drop-shadow(0 0 8px ${achievement.color}80)` : 'none' } : {}} 
     aria-hidden="true" 
   />
 );
 })()}
 </div>

 {!unlocked && (
 <div className="absolute inset-0 flex items-center justify-center bg-surface-2/60 backdrop-blur-[2px] rounded-2xl z-20">
 <Lock size={sizes.lock} className="text-text-primary/70" />
 </div>
 )}

 {unlocked && (
 <motion.div
 className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center z-30 shadow-sm"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', delay: 0.3 }}
 >
 <span className="text-white text-xs font-bold">✓</span>
 </motion.div>
 )}
 </motion.div>

 <div className="text-center z-10 relative">
 <p
 className={cn(
 'text-xs font-dm font-semibold leading-tight transition-colors',
 unlocked ? (isHovered ? 'text-primary' : 'text-text-primary') : 'text-text-secondary'
 )}
 style={unlocked && isHovered && achievement.color ? { color: achievement.color } : {}}
 >
 {achievement.title}
 </p>
 </div>

 {/* Glassmorphism Tooltip */}
 <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center justify-center w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
 <div className="bg-surface/80 /80 backdrop-blur-xl border border-border shadow-xl rounded-xl p-3 text-center">
 <p className="text-xs font-syne font-bold text-text-primary mb-1">{achievement.title}</p>
 <p className="text-[10px] font-dm text-text-secondary leading-snug">{achievement.description}</p>
 {unlocked ? (
 <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-success bg-success/10 rounded-full py-0.5 px-2 w-fit mx-auto">
 <Sparkles size={10} /> +{achievement.xpReward} XP
 </div>
 ) : (
 <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-text-secondary bg-surface-2 rounded-full py-0.5 px-2 w-fit mx-auto">
 <Lock size={10} /> Da {achievement.xpReward} XP al desbloquear
 </div>
 )}
 </div>
 {/* Tooltip arrow */}
 <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border" />
 </div>
 
 <style dangerouslySetInnerHTML={{__html: `
 @keyframes shimmer {
 0% { background-position: 200% center; }
 100% { background-position: -200% center; }
 }
 `}} />
 </motion.div>
 );
}
