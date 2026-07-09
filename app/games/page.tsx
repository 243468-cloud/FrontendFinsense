'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Brain, Scale, Target, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
  const games = [
    {
      id: 'expense-trivia',
      title: '¿Cuánto Gastaste?',
      description: 'Pon a prueba tu memoria sobre tus propios gastos recientes. ¡Conoce tus hábitos!',
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500',
      href: '/games/expense-trivia',
      xpReward: 50,
    },
    {
      id: 'budget-balancer',
      title: 'El Balance Perfecto',
      description: 'Demuestra tu habilidad distribuyendo ingresos. Logra la regla 50/30/20.',
      icon: <Scale className="w-8 h-8 text-success" />,
      color: 'bg-success/10 border-success/20 hover:border-success',
      href: '/games/budget-balancer',
      xpReward: 100,
    },
    {
      id: 'needs-wants',
      title: 'Adivina el Gasto Hormiga',
      description: 'Clasifica los gastos rápidamente entre "Necesidades" y "Deseos".',
      icon: <Target className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500',
      href: '/games/needs-wants',
      xpReward: 75,
      comingSoon: true,
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Gamepad2 className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Minijuegos
          </h1>
          <p className="text-slate-400">Aprende finanzas jugando y gana experiencia (XP)</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {game.comingSoon ? (
              <div className={`relative h-full flex flex-col p-6 rounded-2xl border bg-slate-900/50 ${game.color} opacity-75 cursor-not-allowed overflow-hidden`}>
                <div className="absolute top-4 right-4 bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-300 font-medium">
                  Próximamente
                </div>
                <div className="mb-4 p-3 bg-slate-800 rounded-xl inline-block w-max">
                  {game.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-slate-400 text-sm flex-grow mb-6">{game.description}</p>
              </div>
            ) : (
              <Link href={game.href} className="block h-full">
                <div className={`h-full flex flex-col p-6 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-300 group ${game.color}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-800 rounded-xl">
                      {game.icon}
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                      <Trophy className="w-3 h-3" />
                      +{game.xpReward} XP
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-slate-400 text-sm flex-grow mb-6">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors mt-auto">
                    Jugar ahora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
