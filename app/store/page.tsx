'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Coins, Sparkles, Lock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { getProfile, purchaseStoreItem, equipSkin as equipPetSkin, GamificationProfile } from '@/services/gamificationService';
// Confetti removed
// useWindowSize removed

const STORE_ITEMS = [
  { id: 'theme_cyberpink', name: 'Tema Cyber-Pink', type: 'theme', price: 100, icon: '🌸', color: '#EC4899', source: 'store' },
  { id: 'theme_gold', name: 'Tema Oro Imperial', type: 'theme', price: 150, icon: '👑', color: '#EAB308', source: 'store' },
  { id: 'avatar_dragon', name: 'Avatar Dragón', type: 'avatar', price: 500, icon: '🐉', color: '#EF4444', source: 'store' },
  { id: 'avatar_unicorn', name: 'Avatar Unicornio', type: 'avatar', price: 500, icon: '🦄', color: '#D946EF', source: 'store' },
  { id: 'pet_cat', name: 'Gatito Feliz', type: 'skin', price: 0, icon: '🐱', color: '#FCD34D', source: 'chest' },
  { id: 'pet_dragon', name: 'Dragón Guardián', type: 'skin', price: 0, icon: '🐉', color: '#EF4444', source: 'chest' },
  { id: 'pet_fox', name: 'Zorro Veloz', type: 'skin', price: 0, icon: '🦊', color: '#F97316', source: 'chest' },
  { id: 'pet_unicorn', name: 'Unicornio Mágico', type: 'skin', price: 0, icon: '🦄', color: '#D946EF', source: 'chest' },
];

export default function StorePage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user, preferences, updateUserProfile, updateUserPreferences } = useAuthStore();
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gamiProfile, setGamiProfile] = useState<GamificationProfile | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    getProfile().then(profile => {
      setGamiProfile(profile);
      if (profile.inventory) {
        setPurchasedItems(profile.inventory);
      }
    });
  }, []);

  const userCoins = gamiProfile?.coins ?? 0;

  const handlePurchase = async (id: string, price: number, name: string, type: string, color: string, icon: string) => {
    if (userCoins < price) {
      addToast({ message: 'No tienes suficientes FinCoins', type: 'warning' });
      return;
    }
    
    setIsPurchasing(true);
    try {
      const metadata = type === 'avatar' ? icon : color;
      const result = await purchaseStoreItem(id, price, type as 'avatar' | 'theme', metadata);
      
      setPurchasedItems(result.inventory);
      setGamiProfile(prev => prev ? { ...prev, coins: result.coins, inventory: result.inventory } : null);
      
      if (type === 'avatar') {
        updateUserProfile({ avatar: icon });
      } else if (type === 'theme') {
        updateUserPreferences({ themeColor: color });
      } else if (type === 'skin') {
        await equipPetSkin(id);
        setGamiProfile(prev => prev ? { ...prev, equippedSkin: id } : null);
      }

      setShowConfetti(true);
      addToast({ message: `¡Has desbloqueado ${name}!`, type: 'success' });
      
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err) {
      addToast({ message: 'Error al realizar la compra.', type: 'error' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEquip = async (type: string, color: string, icon: string, name: string, id: string) => {
    if (type === 'avatar') {
      updateUserProfile({ avatar: icon });
      addToast({ message: `Avatar ${name} equipado`, type: 'success' });
    } else if (type === 'theme') {
      updateUserPreferences({ themeColor: color });
      addToast({ message: `Tema ${name} aplicado`, type: 'success' });
    } else if (type === 'skin') {
      try {
        await equipPetSkin(id);
        setGamiProfile(prev => prev ? { ...prev, equippedSkin: id } : null);
        addToast({ message: `Skin ${name} equipada en Finny`, type: 'success' });
      } catch(err) {
        addToast({ message: `Error al equipar skin`, type: 'error' });
      }
    }
  };

  return (
    <PageTransition className="tour-store-view min-h-screen bg-surface-2 pb-24">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
           {/* Fallback simple div confetti if react-confetti is not installed. We'll assume react-confetti is not installed, so we'll use a simple CSS animation or just a toast. Wait, I added it as an import but it's not in package.json. I will remove Confetti import to avoid build errors. */}
        </div>
      )}
      
      <header className="tour-store-header sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-surface-3 transition-colors">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary"/> Bazar FinSense
            </h1>
            <p className="font-dm text-xs text-text-secondary">Gasta tus FinCoins</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-700/50">
          <Coins size={16} className="text-yellow-600 dark:text-yellow-500" />
          <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400">{userCoins}</span>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 text-white shadow-blue-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-syne font-bold text-2xl mb-2 flex items-center gap-2">
                <Sparkles size={24} className="text-yellow-300"/> Tienda Exclusiva
              </h2>
              <p className="font-dm text-white/80 max-w-md">
                Usa los FinCoins que ganas completando misiones y rachas de ahorro para personalizar tu experiencia.
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md text-center">
              <p className="font-dm text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Tu Saldo</p>
              <div className="text-3xl font-mono font-bold flex items-center justify-center gap-2">
                <Coins size={28} className="text-yellow-300"/> {userCoins}
              </div>
            </div>
          </div>
        </motion.div>

        <div>
          <h3 className="font-syne font-bold text-xl mb-4 text-text-primary">Artículos Destacados</h3>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORE_ITEMS.map((item) => {
              const isPurchased = purchasedItems.includes(item.id);
              const canAfford = userCoins >= item.price;
              const isEquipped = item.type === 'avatar' 
                ? user?.avatar === item.icon 
                : item.type === 'theme'
                  ? preferences?.themeColor === item.color
                  : gamiProfile?.equippedSkin === item.id;

              return (
                <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto" style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}>
                    {item.icon}
                  </div>
                  <h4 className="font-syne font-bold text-center text-text-primary mb-1">{item.name}</h4>
                  <p className="text-xs font-dm text-center text-text-secondary uppercase mb-4">{item.type}</p>
                  
                  <div className="mt-auto">
                    {isPurchased ? (
                      isEquipped ? (
                        <button disabled className="w-full py-2.5 rounded-xl font-dm font-bold text-sm bg-surface-3 text-text-secondary flex items-center justify-center gap-2">
                          <Check size={16}/> Equipado
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEquip(item.type, item.color, item.icon, item.name, item.id)}
                          className="w-full py-2.5 rounded-xl font-dm font-bold text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                        >
                          Equipar
                        </button>
                      )
                    ) : item.source === 'chest' ? (
                      <button 
                        disabled
                        className="w-full py-2.5 rounded-xl font-dm font-bold text-sm bg-surface-3 text-text-secondary cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock size={16}/> Solo en Cofres
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(item.id, item.price, item.name, item.type, item.color, item.icon)}
                        disabled={isPurchasing}
                        className={cn(
                          "w-full py-2.5 rounded-xl font-dm font-bold text-sm flex items-center justify-center gap-2 transition-colors",
                          canAfford && !isPurchasing ? "bg-primary text-white hover:bg-primary/90" : "bg-surface-3 text-text-secondary cursor-not-allowed"
                        )}
                      >
                        {canAfford ? <Coins size={16}/> : <Lock size={16}/>}
                        {item.price} Coins
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </PageTransition>
  );
}
