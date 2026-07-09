'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, AlertCircle, Pencil } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type Mood = 'happy' | 'neutral' | 'sad' | 'sleeping';

export function VirtualPet() {
  const { preferences, updateUserPreferences, user } = useAuthStore();
  const petName = preferences?.petName || 'Finny';

  const [mood, setMood] = useState<Mood>('neutral');
  const [equippedSkin, setEquippedSkin] = useState<string>('default');
  const [budgetStatus, setBudgetStatus] = useState<string>('on_track');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(`¡Hola! Soy ${petName}.`);
  const [showMessage, setShowMessage] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(petName);
  const [animationData, setAnimationData] = useState<any>(null);

  // Parallax / Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth out mouse movement
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100 });
  
  // Map mouse position to rotation and slight translation
  const rotateX = useTransform(smoothY, [-500, 500], [15, -15]);
  const rotateY = useTransform(smoothX, [-500, 500], [-15, 15]);
  const translateX = useTransform(smoothX, [-500, 500], [-10, 10]);
  const translateY = useTransform(smoothY, [-500, 500], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to screen center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    // If it's a new pet that we don't have Lottie for, don't load animation data
    if (['pet_cat', 'pet_dragon', 'pet_fox', 'pet_unicorn'].includes(equippedSkin)) {
      setAnimationData(null);
      return;
    }
    
    // Load default Lottie animation for dog or skins
    fetch('/lotties/dog.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch((e: any) => { console.error(e); });
  }, [equippedSkin]);

  useEffect(() => {
    async function fetchMoodData() {
      try {
        const [profileRes, summaryRes] = await Promise.all([
          apiClient.get('/gamification/profile').catch(() => null),
          apiClient.get('/analytics/summary').catch(() => null)
        ]);

        const profile = profileRes?.data;
        const summary = summaryRes?.data;

        if (profile) {
          setEquippedSkin(profile.equippedSkin || 'default');
        }

        if (summary) {
          setBudgetStatus(summary.budgetStatus || 'on_track');
        }
      } catch (err) {
        setMood('sleeping');
        setMessage('Zzz...');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMoodData();
  }, [petName]);

  useEffect(() => {
    if (isLoading) return;
    const currentStreak = user?.streakDays ?? 0;
    if (budgetStatus === 'exceeded' || budgetStatus === 'warning') {
      setMood('sad');
      setMessage('¡Cuidado! Estamos gastando muy rápido.');
    } else if (currentStreak === 0) {
      setMood('sad');
      setMessage('¡Oh no! Perdimos la racha...');
    } else {
      setMood('happy');
      if (currentStreak > 3) setMessage('¡Qué racha tan increíble llevamos!');
      else setMessage('¡Bien hecho! Sigamos con la racha.');
    }
  }, [budgetStatus, user?.streakDays, petName, isLoading]);

  useEffect(() => {
    if (isLoading || mood === 'sleeping') return;
    const interval = setInterval(() => {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, [isLoading, mood]);

  if (isLoading) return null;

  // Determine skin filter
  const getSkinFilter = () => {
    const currentStreak = user?.streakDays ?? 0;
    const isSadStreak = mood === 'sad' && currentStreak === 0;
    const baseFilter = (() => {
      switch (equippedSkin) {
        case 'skin_ninja': return 'invert(1) hue-rotate(180deg)';
        case 'skin_astronaut': return 'saturate(0) brightness(1.5)';
        case 'skin_cyberpunk': return 'hue-rotate(280deg) saturate(2)';
        case 'skin_gold': return 'sepia(1) saturate(3) hue-rotate(10deg) brightness(1.2)';
        default: return 'none';
      }
    })();
    return isSadStreak ? (baseFilter !== 'none' ? `${baseFilter} grayscale(1)` : 'grayscale(1)') : baseFilter;
  };

  return (
    <div className="relative flex flex-col items-center justify-center pt-14 pb-8 px-2 sm:px-4 w-full h-full min-h-[180px] sm:min-h-[220px] perspective-[1000px]">
      
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute top-2 bg-surface text-text-primary text-[10px] font-dm font-semibold px-3 py-1.5 rounded-2xl shadow-card border border-border max-w-[140px] text-center whitespace-pre-wrap z-50"
          >
            {message}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-b border-r border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Physics Container */}
      <motion.div
        drag
        dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
        dragElastic={0.4}
        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
        }}
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
        }}
        className="relative w-32 h-32 flex items-center justify-center cursor-grab z-20"
      >
        {/* Glow effect based on skin */}
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50" />

        {animationData ? (
          <div style={{ filter: getSkinFilter(), width: '100%', height: '100%', pointerEvents: 'none' }}>
            <Lottie 
              animationData={animationData} 
              loop={mood !== 'sleeping'}
              autoplay={true}
              // @ts-ignore
              speed={mood === 'happy' ? 1.5 : mood === 'sleeping' ? 0.5 : 1}
            />
          </div>
        ) : ['pet_cat', 'pet_dragon', 'pet_fox', 'pet_unicorn'].includes(equippedSkin) ? (
          <motion.div 
            animate={{
              scale: mood === 'happy' ? [1, 1.1, 1] : mood === 'sleeping' ? [1, 1.05, 1] : [1, 1.02, 1],
              rotate: mood === 'happy' ? [0, 5, -5, 0] : [0, 0, 0],
            }}
            transition={{ duration: mood === 'happy' ? 2 : 4, repeat: Infinity }}
            className="text-7xl select-none flex items-center justify-center w-full h-full pointer-events-none drop-shadow-2xl"
          >
            {equippedSkin === 'pet_cat' && '🐱'}
            {equippedSkin === 'pet_dragon' && '🐉'}
            {equippedSkin === 'pet_fox' && '🦊'}
            {equippedSkin === 'pet_unicorn' && '🦄'}
          </motion.div>
        ) : (
          <div className="w-20 h-20 bg-primary/20 rounded-full animate-pulse" />
        )}
        
        <AnimatePresence>
          {mood === 'happy' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-0 right-0 text-yellow-400 drop-shadow-md z-30 pointer-events-none"
            >
              <Sparkles size={20} />
            </motion.div>
          )}
          {mood === 'sad' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-0 right-0 text-blue-400 drop-shadow-md z-30 pointer-events-none"
            >
              <AlertCircle size={20} />
            </motion.div>
          )}
          {mood === 'sleeping' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-2 -right-2 text-primary/70 drop-shadow-md font-bold text-sm z-30 pointer-events-none"
            >
              zZ
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Shadow floor */}
      <div className="relative flex flex-col items-center mt-2 z-0 pointer-events-none">
        <div className="w-20 h-4 bg-black/10 dark:bg-black/30 rounded-[100%] blur-[3px]" />
      </div>

      {/* Editable Name Tag */}
      <div className="absolute bottom-0 z-40 flex items-center justify-center w-full">
        {isEditingName ? (
          <div className="flex items-center bg-surface border border-primary/30 rounded-full px-2 py-1 shadow-lg">
            <input 
              autoFocus
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={() => {
                setIsEditingName(false);
                if (tempName.trim()) updateUserPreferences({ petName: tempName.trim() });
                else setTempName(petName);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsEditingName(false);
                  if (tempName.trim()) updateUserPreferences({ petName: tempName.trim() });
                  else setTempName(petName);
                }
              }}
              className="bg-transparent text-[10px] font-dm font-bold text-text-primary w-20 outline-none text-center"
              maxLength={15}
            />
          </div>
        ) : (
          <button 
            onClick={() => { setTempName(petName); setIsEditingName(true); }}
            className="group flex items-center gap-1.5 bg-surface/90 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            title="Editar nombre"
          >
            <span className="text-[10px] font-dm font-bold text-text-primary">{petName}</span>
            <Pencil size={10} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}
