'use client';
// Landing Page — Hero animado, features swipeables, CTA
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Trophy, Users, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createRipple } from '@/lib/utils';

// ─── Letter-by-letter animation for hero title ───
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <motion.h1
      className="font-syne font-black text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-3">
          {word.split('').map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20, rotateX: -90 },
                visible: { opacity: 1, y: 0, rotateX: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

const features = [
  {
    id: 'local',
    emoji: '🌮',
    title: 'Contexto Local',
    description:
      'Compara tus gastos con el promedio de Tuxtla Gutiérrez. Sabe si pagas de más en comida, transporte y más.',
    color: '#FF6B6B',
    bgColor: '#FFF0F0',
    gradient: 'from-red-50 to-orange-50',
  },
  {
    id: 'goals',
    emoji: '🎯',
    title: 'Metas Gamificadas',
    description:
      'Gana XP, desbloquea insignias y mantén rachas diarias. Ahorrar nunca había sido tan adictivo.',
    color: '#0057FF',
    bgColor: '#F0F5FF',
    gradient: 'from-blue-50 to-cyan-50',
  },
  {
    id: 'groups',
    emoji: '🤝',
    title: 'Modo Colaborativo',
    description:
      'Divide gastos con amigos o roomies fácilmente. Splits automáticos, sin matemáticas.',
    color: '#00C896',
    bgColor: '#F0FFF9',
    gradient: 'from-emerald-50 to-teal-50',
  },
];

const stats = [
  { value: '3,500+', label: 'Jóvenes en Tuxtla' },
  { value: '$800', label: 'Ahorro promedio/mes' },
  { value: '4.8★', label: 'Calificación' },
];

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const geoY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  function handleStart(e: React.MouseEvent<HTMLButtonElement>) {
    createRipple(e);
    router.push('/auth');
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-surface-2 to-surface-3"
    >
      {/* ─── Decorative Geometric Shapes ─── */}
      <motion.div
        style={{ y: geoY }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="geo-circle w-[500px] h-[500px] -top-48 -right-48 opacity-60" />
        <div className="geo-circle w-[300px] h-[300px] top-[60%] -left-32 opacity-40" />
        <div
          className="geo-hex w-[200px] h-[200px] top-1/3 right-[15%] opacity-30"
          style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.1) 0%, rgba(0,87,255,0.06) 100%)' }}
        />
        <div
          className="geo-hex w-[120px] h-[120px] bottom-1/4 left-[20%] opacity-20"
          style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.12) 0%, rgba(0,87,255,0.06) 100%)' }}
        />
      </motion.div>

      {/* ─── Header ─── */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-blue-sm">
            <span className="text-white font-syne font-bold text-sm">FS</span>
          </div>
          <span className="font-syne font-bold text-xl text-text-primary">FinSense</span>
        </div>

        <button
          onClick={() => router.push('/auth')}
          className="font-dm font-semibold text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </motion.header>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 px-6 pt-10 pb-16 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          {/* City badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-blue-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <MapPin size={14} className="text-primary" aria-hidden="true" />
            <span className="font-dm text-sm text-text-secondary">
              Diseñado para{' '}
              <span className="font-semibold text-primary">Tuxtla Gutiérrez</span>
            </span>
          </motion.div>

          {/* Animated title */}
          <AnimatedTitle text="Controla tu dinero. A tu manera." />

          {/* Subtitle */}
          <motion.p
            className="font-dm text-lg text-text-secondary mt-4 mb-8 leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            La primera app de finanzas personales pensada para jóvenes en Tuxtla.
            Metas gamificadas, gastos grupales y contexto local.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button
              size="lg"
              onClick={handleStart}
              icon={<ArrowRight size={20} aria-hidden="true" />}
              iconPosition="right"
              className="text-base font-syne"
            >
              Empezar gratis
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/dashboard')}
            >
              Ver demo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex items-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex -space-x-2">
              {['🧑', '👩', '🧑‍🦱', '👨‍🎓'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-2 to-surface-3 border-2 border-white flex items-center justify-center text-sm"
                  aria-hidden="true"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="font-dm text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">3,500+</span>{' '}
              jóvenes en Tuxtla ya controlan sus finanzas
            </p>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-3 gap-4 mt-16 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-border shadow-card max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-syne font-bold text-xl text-primary">{stat.value}</p>
              <p className="font-dm text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features Horizontal Scroll ─── */}
      <section className="relative z-10 pb-16" aria-labelledby="features-title">
        <div className="px-6 max-w-6xl mx-auto mb-6">
          <motion.h2
            id="features-title"
            className="font-syne font-bold text-2xl text-text-primary"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Todo lo que necesitas
          </motion.h2>
        </div>

        <div className="scroll-x-hidden flex gap-4 px-6 pb-4" role="list">
          {features.map((feature, i) => (
            <motion.article
              key={feature.id}
              className="flex-shrink-0 w-72 bg-white rounded-3xl p-6 border border-border shadow-card"
              style={{
                boxShadow: `0 8px 32px ${feature.color}20`,
              }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: `0 16px 48px ${feature.color}30` }}
              role="listitem"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: feature.bgColor }}
                aria-hidden="true"
              >
                {feature.emoji}
              </div>
              <h3 className="font-syne font-bold text-lg text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="font-dm text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative z-10 px-6 pb-16 max-w-6xl mx-auto">
        <motion.div
          className="bg-gradient-primary rounded-3xl p-8 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" aria-hidden="true" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex justify-center gap-1 mb-4" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-yellow-300 fill-yellow-300" />
              ))}
            </div>
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-white mb-3">
              Empieza a controlar tu dinero hoy
            </h2>
            <p className="font-dm text-white/80 mb-6 max-w-md mx-auto">
              Gratis, sin tarjeta de crédito. Tu primera meta en menos de 2 minutos.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={handleStart}
              className="bg-white text-primary border-white hover:bg-surface-2 hover:text-primary font-syne"
            >
              Comenzar ahora — es gratis
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
