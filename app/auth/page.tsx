'use client';
// Auth Page — Login / Registro con float labels y fortaleza de contraseña
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { login, register } from '@/services/authService';
import { getPasswordStrength } from '@/lib/utils';
import type { Metadata } from 'next';

type AuthMode = 'login' | 'register';

// Password strength indicator
function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < strength.score ? strength.color : '#E8EEFF',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-xs font-dm" style={{ color: strength.color }}>
        {strength.label}
      </p>
    </div>
  );
}

// Illustration panel for desktop
function IllustrationPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
      {/* Geometric decorations */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 -left-16 w-48 h-48 rounded-full opacity-15"
        style={{ background: 'rgba(255,255,255,0.4)' }}
        aria-hidden="true"
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-white font-syne font-bold text-lg">FS</span>
        </div>
        <span className="text-white font-syne font-bold text-2xl">FinSense</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-syne font-black text-4xl text-white leading-tight mb-4">
            Tu dinero,<br />bajo control.
          </h2>
          <p className="font-dm text-white/80 text-lg leading-relaxed">
            Diseñado para jóvenes en Tuxtla Gutiérrez que quieren tomar el control de sus finanzas personales.
          </p>
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { emoji: '🎯', text: 'Metas de ahorro gamificadas' },
            { emoji: '🌮', text: 'Benchmarks locales de Tuxtla' },
            { emoji: '🤝', text: 'Gastos grupales con amigos' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                <span role="img" aria-hidden="true">{item.emoji}</span>
              </div>
              <p className="font-dm text-white/90 font-medium">{item.text}</p>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { value: '3,500+', label: 'Usuarios activos' },
            { value: '$800', label: 'Ahorro promedio/mes' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
              <p className="font-mono font-bold text-2xl text-white">{stat.value}</p>
              <p className="font-dm text-xs text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <p className="relative z-10 font-dm text-white/50 text-sm">
        © 2024 FinSense · Tuxtla Gutiérrez, Chiapas
      </p>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) {
          addToast({ message: 'Por favor ingresa tu nombre', type: 'error' });
          setIsLoading(false);
          return;
        }
        result = await register({ name: form.name, email: form.email, password: form.password });
      }
      setUser(result.user);
      addToast({
        message: mode === 'login' ? `¡Bienvenido, ${result.user.name.split(' ')[0]}! 👋` : '¡Cuenta creada exitosamente! 🎉',
        type: 'success',
      });
      router.push('/dashboard');
    } catch {
      addToast({
        message: mode === 'login' ? 'Correo o contraseña incorrectos' : 'Error al crear la cuenta',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Illustration (desktop) */}
      <div className="flex-1">
        <IllustrationPanel />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative bg-surface pattern-dots lg:bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10 self-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-blue-sm">
            <span className="text-white font-syne font-bold text-sm">FS</span>
          </div>
          <span className="font-syne font-bold text-xl text-text-primary">FinSense</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                className="font-syne font-bold text-3xl text-text-primary mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {mode === 'login' ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
              </motion.h1>
            </AnimatePresence>
            <p className="font-dm text-text-secondary text-sm">
              {mode === 'login'
                ? 'Ingresa tus datos para continuar'
                : 'Únete a miles de jóvenes en Tuxtla'}
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex bg-surface-2 rounded-xl p-1 mb-6"
            role="tablist"
            aria-label="Modo de autenticación"
          >
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                className="flex-1 py-2 text-sm font-dm font-semibold rounded-lg transition-all duration-200 relative"
                onClick={() => setMode(m)}
              >
                <span
                  className={
                    mode === m ? 'text-primary relative z-10' : 'text-text-secondary'
                  }
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </span>
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-blue-sm"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Input
                    label="Nombre completo"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    icon={<User size={18} />}
                    autoComplete="name"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              icon={<Mail size={18} />}
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                icon={<Lock size={18} />}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              {mode === 'register' && (
                <PasswordStrengthBar password={form.password} />
              )}
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="font-dm text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              icon={<ArrowRight size={20} aria-hidden="true" />}
              iconPosition="right"
              className="mt-2"
            >
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </motion.form>

          {/* Terms */}
          {mode === 'register' && (
            <p className="mt-4 text-xs text-text-secondary font-dm text-center">
              Al registrarte aceptas nuestros{' '}
              <span className="text-primary cursor-pointer hover:underline">Términos de uso</span>
              {' '}y{' '}
              <span className="text-primary cursor-pointer hover:underline">Política de privacidad</span>
            </p>
          )}

          {/* Demo access */}
          <div className="mt-6 p-4 bg-surface-2 rounded-2xl border border-border">
            <p className="font-dm text-xs text-text-secondary text-center mb-2">
              ✨ Acceso demo rápido
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setForm({ name: 'Marco García', email: 'marco@demo.com', password: 'Demo123!' });
                setMode('login');
              }}
              icon={<TrendingUp size={16} aria-hidden="true" />}
            >
              Usar cuenta de prueba
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
