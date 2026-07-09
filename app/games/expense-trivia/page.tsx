'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/apiClient';

export default function ExpenseTrivia() {
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'playing' | 'result'>('intro');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const handleStart = async () => {
    setGameState('loading');
    try {
      const { data } = await api.get('/gamification/trivia-questions');
      setQuestions(data);
      setScore(0);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setGameState('playing');
    } catch (error) {
      console.error(error);
      setGameState('intro');
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    
    setTimeout(() => {
      if (index === questions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  const handleFinish = async () => {
    if (score === questions.length) {
      try {
        await api.post('/gamification/game-score', { xpReward: 50, gameId: 'expense-trivia' });
      } catch (error) {
        console.error('Error granting XP', error);
      }
    }
    setGameState('intro');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8 pb-24 min-h-[80vh] flex flex-col">
      <Link href="/games" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max">
        <ArrowLeft className="w-4 h-4" />
        Volver a Minijuegos
      </Link>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Brain className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">¿Cuánto Gastaste?</h1>
          <p className="text-slate-400">Demuestra qué tanto conoces tus propios hábitos de gasto.</p>
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
              <div className="mb-6 inline-flex justify-center p-4 bg-blue-500/10 rounded-full">
                <Brain className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">¡Ponte a prueba!</h2>
              <p className="text-slate-400 mb-8">
                Te haremos preguntas basadas en tu propio historial de gastos. 
                Si respondes correctamente ganarás +50 XP.
              </p>
              <button
                onClick={handleStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                Comenzar Trivia
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Analizando tus gastos...</p>
            </motion.div>
          )}

          {gameState === 'playing' && questions.length > 0 && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-slate-400 font-medium">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </span>
                <span className="text-slate-400 font-medium">
                  Puntaje: {score}
                </span>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm mb-6">
                <h3 className="text-xl text-white font-medium text-center">
                  {questions[currentQuestion].question}
                </h3>
              </div>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option: string, index: number) => {
                  let buttonClass = "w-full p-4 rounded-xl border text-left font-medium transition-all duration-300 ";
                  
                  if (selectedAnswer === null) {
                    buttonClass += "border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:border-blue-500";
                  } else {
                    if (index === questions[currentQuestion].correctAnswer) {
                      buttonClass += "border-success bg-success/20 text-success";
                    } else if (index === selectedAnswer) {
                      buttonClass += "border-red-500 bg-red-500/20 text-red-400";
                    } else {
                      buttonClass += "border-slate-800 bg-slate-900/50 text-slate-600 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={buttonClass}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
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
                <Trophy className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">¡Trivia Terminada!</h2>
              <p className="text-slate-400 mb-6">
                Acertaste {score} de {questions.length} preguntas.
              </p>
              
              {score === questions.length ? (
                <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  +50 XP Obtenidos
                </div>
              ) : (
                <div className="mb-8 p-4 bg-slate-800 rounded-xl text-slate-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  No conseguiste XP esta vez. ¡Inténtalo de nuevo!
                </div>
              )}

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                Volver a Minijuegos
              </button>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
