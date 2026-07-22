'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ArrowLeft, Trophy, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/apiClient';

export default function BudgetBalancer() {
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'playing' | 'result'>('intro');
  const [income, setIncome] = useState(10000);
  
  // Rule: 50% Needs, 30% Wants, 20% Savings
  const [needs, setNeeds] = useState(0);
  const [wants, setWants] = useState(0);
  const [savings, setSavings] = useState(0);
  
  const [score, setScore] = useState(0);

  const totalAllocated = needs + wants + savings;
  const remaining = income - totalAllocated;

  const handleStart = async () => {
    setGameState('loading');
    try {
      const { data } = await api.get('/gamification/budget-game-data');
      // Round income to nearest 100 so sliders (step=100) can sum to exactly the income amount
      const rawIncome = data.income || 10000;
      setIncome(Math.round(rawIncome / 100) * 100);
      setNeeds(0);
      setWants(0);
      setSavings(0);
      setGameState('playing');
    } catch (error) {
      console.error(error);
      setGameState('intro');
    }
  };

  const handleFinish = async () => {
    // Calculate score based on how close they are to 50/30/20
    const targetNeeds = income * 0.5;
    const targetWants = income * 0.3;
    const targetSavings = income * 0.2;

    const diffNeeds = Math.abs(needs - targetNeeds) / targetNeeds;
    const diffWants = Math.abs(wants - targetWants) / targetWants;
    const diffSavings = Math.abs(savings - targetSavings) / targetSavings;

    const avgDiff = (diffNeeds + diffWants + diffSavings) / 3;
    const finalScore = Math.max(0, Math.round((1 - avgDiff) * 100));
    setScore(finalScore);
    
    if (finalScore >= 70) {
      const xpToGive = finalScore >= 90 ? 100 : 50;
      try {
        await api.post('/gamification/game-score', { xpReward: xpToGive, gameId: 'budget-balancer' });
      } catch (error) {
        console.error('Error granting XP', error);
      }
    }
    
    setGameState('result');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8 pb-24 min-h-[80vh] flex flex-col">
      <Link href="/games" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max">
        <ArrowLeft className="w-4 h-4" />
        Volver a Minijuegos
      </Link>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-success/10 rounded-xl">
          <Scale className="w-8 h-8 text-success" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">El Balance Perfecto</h1>
          <p className="text-slate-400">Distribuye el presupuesto siguiendo la regla 50/30/20.</p>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-center"
            >
              <div className="mb-6 inline-flex justify-center p-4 bg-success/10 rounded-full">
                <Scale className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">La Regla de Oro</h2>
              <p className="text-slate-400 mb-8 text-left">
                Usaremos tu <strong>ingreso promedio mensual</strong> (o un monto simulado de $10,000). Tu objetivo es usar los controles deslizantes para asignarlo en tres categorías:
                <br /><br />
                • <strong>Necesidades (50%)</strong><br />
                • <strong>Deseos (30%)</strong><br />
                • <strong>Ahorro (20%)</strong><br />
                <br />
                ¡Mientras más preciso seas, mayor será tu puntuación (XP)!
              </p>
              <button
                onClick={handleStart}
                className="w-full py-4 bg-success hover:bg-success text-white rounded-xl font-bold transition-colors"
              >
                Comenzar Simulación
              </button>
            </motion.div>
          )}

          {gameState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-slate-400"
            >
              <Loader2 className="w-8 h-8 animate-spin text-success" />
              <p>Calculando tu ingreso promedio...</p>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ingreso Disponible</p>
                  <p className="text-3xl font-bold text-success">${income}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Restante</p>
                  <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                    ${remaining}
                  </p>
                </div>
              </div>

              <div className="space-y-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-medium">Necesidades</label>
                    <span className="text-slate-400">${needs} ({((needs/income)*100).toFixed(0)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={income}
                    step="100"
                    value={needs}
                    onChange={(e) => setNeeds(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-medium">Deseos</label>
                    <span className="text-slate-400">${wants} ({((wants/income)*100).toFixed(0)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={income}
                    step="100"
                    value={wants}
                    onChange={(e) => setWants(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white font-medium">Ahorros y Deudas</label>
                    <span className="text-slate-400">${savings} ({((savings/income)*100).toFixed(0)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={income}
                    step="100"
                    value={savings}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-success"
                  />
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={remaining !== 0}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${
                  remaining === 0 
                    ? 'bg-success hover:bg-success text-white' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {remaining === 0 ? 'Evaluar Presupuesto' : `Debes asignar exactamente $${income.toLocaleString('es-MX')}`}
              </button>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-center"
            >
              <div className="mb-6 inline-flex justify-center p-4 bg-success/10 rounded-full">
                <DollarSign className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Evaluación</h2>
              <p className="text-slate-400 mb-6">
                Tu precisión con la regla 50/30/20 fue del {score}%.
              </p>
              
              {score >= 90 ? (
                <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  +100 XP Obtenidos (¡Maestro del Presupuesto!)
                </div>
              ) : score >= 70 ? (
                <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  +50 XP Obtenidos (Buen trabajo)
                </div>
              ) : (
                <div className="mb-8 p-4 bg-slate-800 rounded-xl text-slate-400 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Tu precisión fue baja. Intenta acercarte más a 50%, 30% y 20%.
                </div>
              )}

              <button
                onClick={() => setGameState('intro')}
                className="w-full py-4 bg-success hover:bg-success text-white rounded-xl font-bold transition-colors mb-4"
              >
                Volver a Jugar
              </button>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
