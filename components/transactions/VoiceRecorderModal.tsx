'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onStop: () => void;
}

export function VoiceRecorderModal({
  isOpen,
  isListening,
  transcript,
  onClose,
  onStop,
}: VoiceRecorderModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-surface/80 backdrop-blur-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-full bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors shadow-sm"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center max-w-md w-full gap-8">
            {/* Pulsing microphone */}
            <div className="relative flex items-center justify-center">
              <AnimatePresence>
                {isListening && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full bg-primary/30"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                      className="absolute inset-0 rounded-full bg-primary/40"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <motion.button
                onClick={onStop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-blue-lg transition-colors duration-300",
                  isListening ? "bg-primary text-white" : "bg-surface-2 text-primary"
                )}
              >
                <Mic size={40} className={cn(isListening && "animate-pulse")} />
              </motion.button>
            </div>

            {/* Status text */}
            <div className="text-center space-y-2">
              <h2 className="font-syne font-bold text-2xl text-text-primary">
                {isListening ? "Escuchando..." : "Grabación terminada"}
              </h2>
              <p className="font-dm text-text-secondary text-sm">
                Di algo como: "Gasté 50 pesos en un café" o "Recibí 1000 de salario"
              </p>
            </div>

            {/* Live transcript */}
            <div className="w-full bg-surface border border-border rounded-2xl p-6 min-h-[120px] shadow-sm relative overflow-hidden flex flex-col justify-center">
              {isListening && !transcript && (
                <div className="flex items-center justify-center text-text-secondary gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-dm text-sm italic">Esperando tu voz...</span>
                </div>
              )}
              {transcript && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-dm text-lg text-text-primary text-center font-medium"
                >
                  "{transcript}"
                </motion.p>
              )}
            </div>

            {/* Action buttons */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl bg-surface-2 text-text-primary font-dm font-bold text-sm shadow-sm border border-border"
            >
              {isListening ? "Cancelar" : "Cerrar y ver datos"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
