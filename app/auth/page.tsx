'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  ArrowLeft, 
  Key,
  CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { login, register } from '@/services/authService';
import { getPasswordStrength } from '@/lib/utils';

type AuthMode = 'login' | 'register' | 'recover';
type RecoverStep = 'email' | 'code' | 'reset';

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
      <p className="text-xs font-dm font-semibold" style={{ color: strength.color }}>
        {strength.label}
      </p>
    </div>
  );
}

// Illustration panel for desktop
function IllustrationPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-accent relative overflow-hidden h-full">
      {/* Geometric decorations */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 bg-white"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 -left-16 w-48 h-48 rounded-full opacity-15 bg-white"
        aria-hidden="true"
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <span className="text-white font-syne font-black text-lg">FS</span>
        </div>
        <span className="text-white font-syne font-bold text-2xl tracking-tight">FinSense</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-syne font-black text-4xl text-white leading-tight mb-4">
            Tu dinero,<br />bajo control.
          </h2>
          <p className="font-dm text-white/80 text-base leading-relaxed max-w-sm">
            La primera plataforma de finanzas pensada y adaptada para jóvenes y estudiantes en Chiapas.
          </p>
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { emoji: '🎯', text: 'Retos de ahorro gamificados' },
            { emoji: '📍', text: 'Costo de vida en Tuxtla Gutiérrez' },
            { emoji: '👥', text: 'Gastos colaborativos sin fricciones' },
            { emoji: '🔒', text: '100% seguro sin vincular bancos' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0 border border-white/10">
                <span role="img" aria-hidden="true">{item.emoji}</span>
              </div>
              <p className="font-dm text-white/95 text-sm font-medium">{item.text}</p>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-4 max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { value: '3,500+', label: 'Jóvenes en Tuxtla' },
            { value: '$800', label: 'Ahorro promedio' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-center">
              <p className="font-mono font-bold text-xl text-white">{stat.value}</p>
              <p className="font-dm text-[11px] text-white/70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <p className="relative z-10 font-dm text-white/40 text-xs">
        © 2026 FinSense · Universidad Politécnica de Chiapas
      </p>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [recoverStep, setRecoverStep] = useState<RecoverStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
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
      if (mode === 'login') {
        const result = await login({ email: form.email, password: form.password });
        setUser(result.user);
        addToast({
          message: `¡Bienvenido de nuevo, ${result.user.name.split(' ')[0]}! 👋`,
          type: 'success',
        });
        router.push('/dashboard');
      } else if (mode === 'register') {
        if (!form.name.trim()) {
          addToast({ message: 'Por favor ingresa tu nombre', type: 'error' });
          setIsLoading(false);
          return;
        }
        const result = await register({ name: form.name, email: form.email, password: form.password });
        setUser(result.user);
        addToast({
          message: '¡Cuenta creada exitosamente! 🎉 Bienvenido a FinSense.',
          type: 'success',
        });
        router.push('/dashboard');
      } else if (mode === 'recover') {
        if (recoverStep === 'email') {
          if (!form.email.includes('@')) {
            addToast({ message: 'Por favor ingresa un correo válido', type: 'error' });
            setIsLoading(false);
            return;
          }
          await new Promise((r) => setTimeout(r, 1000));
          addToast({
            message: 'Código de recuperación enviado. Usa "123456" para la demo. ✉️',
            type: 'success',
          });
          setRecoverStep('code');
        } else if (recoverStep === 'code') {
          if (form.verificationCode !== '123456') {
            addToast({ message: 'Código incorrecto. Ingresa "123456" para la demo.', type: 'error' });
            setIsLoading(false);
            return;
          }
          await new Promise((r) => setTimeout(r, 800));
          addToast({ message: 'Código validado correctamente. Crea tu nueva contraseña.', type: 'success' });
          setRecoverStep('reset');
        } else if (recoverStep === 'reset') {
          if (form.newPassword.length < 6) {
            addToast({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
            setIsLoading(false);
            return;
          }
          if (form.newPassword !== form.confirmPassword) {
            addToast({ message: 'Las contraseñas no coinciden', type: 'error' });
            setIsLoading(false);
            return;
          }
          await new Promise((r) => setTimeout(r, 1200));
          addToast({ message: 'Contraseña restablecida correctamente. ¡Ya puedes iniciar sesión! 🔒', type: 'success' });
          setMode('login');
          setRecoverStep('email');
          setForm(prev => ({ ...prev, password: '', verificationCode: '', newPassword: '', confirmPassword: '' }));
        }
      }
    } catch {
      addToast({
        message: mode === 'login' ? 'Correo o contraseña incorrectos' : 'Error en la operación',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleBackToLogin = () => {
    setMode('login');
    setRecoverStep('email');
  };

  const handleBackStep = () => {
    if (recoverStep === 'code') {
      setRecoverStep('email');
    } else if (recoverStep === 'reset') {
      setRecoverStep('code');
    } else {
      setMode('login');
    }
  };

  const formVariants = {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -25 },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface">
      {/* Left Column: Illustration (desktop) */}
      <div className="hidden lg:flex flex-1">
        <IllustrationPanel />
      </div>

      {/* Right Column: Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 relative pattern-dots overflow-y-auto">
        
        {/* Mobile top banner */}
        <div className="lg:hidden w-full max-w-sm mb-6">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-primary to-accent rounded-2xl cursor-pointer shadow-blue-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-blue-sm">
              <span className="text-white font-syne font-black text-sm">FS</span>
            </div>
            <span className="font-syne font-black text-xl text-white">FinSense</span>
          </div>
        </div>

        {/* Back to Home desktop link */}
        <button 
          onClick={() => router.push('/')}
          className="hidden lg:flex items-center gap-1.5 absolute top-8 right-8 text-xs font-semibold text-text-secondary hover:text-primary transition-colors font-dm"
        >
          <ArrowLeft size={14} />
          <span>Volver al inicio</span>
        </button>

        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-card relative overflow-hidden">
          
          {/* Header Title with Animated Transitions */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="title-login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-text-primary mb-1">
                    ¡Hola de nuevo! 👋
                  </h1>
                  <p className="font-dm text-text-secondary text-xs sm:text-sm">
                    Ingresa tus credenciales para continuar controlando tus finanzas.
                  </p>
                </motion.div>
              )}
              {mode === 'register' && (
                <motion.div
                  key="title-register"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-text-primary mb-1">
                    Crea tu cuenta
                  </h1>
                  <p className="font-dm text-text-secondary text-xs sm:text-sm">
                    Únete a miles de jóvenes chiapanecos y ahorra de forma divertida.
                  </p>
                </motion.div>
              )}
              {mode === 'recover' && (
                <motion.div
                  key="title-recover"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <button 
                      onClick={handleBackStep} 
                      className="text-text-secondary hover:text-primary transition-colors p-1 -ml-1 rounded-full hover:bg-surface-2"
                      aria-label="Volver al paso anterior"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <h1 className="font-syne font-extrabold text-2xl text-text-primary">
                      {recoverStep === 'email' && 'Recuperar Cuenta'}
                      {recoverStep === 'code' && 'Validar Código'}
                      {recoverStep === 'reset' && 'Nueva Contraseña'}
                    </h1>
                  </div>
                  <p className="font-dm text-text-secondary text-xs">
                    {recoverStep === 'email' && 'Ingresa tu correo para recibir el código de validación.'}
                    {recoverStep === 'code' && 'Ingresa el código de 6 dígitos enviado a tu correo.'}
                    {recoverStep === 'reset' && 'Ingresa una nueva contraseña segura para restablecer tu cuenta.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab Toggle (Only visible in login/register) */}
          <AnimatePresence>
            {mode !== 'recover' && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-2 rounded-2xl p-1 flex border border-primary/5"
              >
                {(['login', 'register'] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    className="flex-1 py-2.5 text-xs sm:text-sm font-dm font-bold rounded-xl transition-all duration-200 relative"
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    <span className={mode === m ? 'text-primary relative z-10 font-bold' : 'text-text-secondary relative z-10'}>
                      {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </span>
                    {mode === m && (
                      <motion.div
                        layoutId="auth-active-tab"
                        className="absolute inset-0 bg-white rounded-xl shadow-blue-sm border border-primary/5"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content with Animation */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="form-login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Input
                    label="Correo electrónico"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    icon={<Mail size={18} />}
                    autoComplete="email"
                    required
                  />

                  <Input
                    label="Contraseña"
                    type="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    icon={<Lock size={18} />}
                    autoComplete="current-password"
                    required
                  />

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('recover');
                        setRecoverStep('email');
                      }}
                      className="font-dm text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    className="font-syne font-bold text-sm shadow-blue-sm"
                  >
                    Iniciar Sesión
                  </Button>
                </motion.div>
              )}

              {mode === 'register' && (
                <motion.div
                  key="form-register"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Trust Banner - 100% autónomo */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl p-3 text-xs flex items-start gap-2.5">
                    <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-dm leading-relaxed">
                        <strong className="font-bold text-emerald-800">100% Autónomo y Seguro:</strong> Administra tus finanzas de forma privada. Nunca requerimos vincular tus cuentas o contraseñas bancarias.
                      </p>
                    </div>
                  </div>

                  <Input
                    label="Nombre completo"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    icon={<User size={18} />}
                    autoComplete="name"
                    required
                  />

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
                      autoComplete="new-password"
                      required
                    />
                    <PasswordStrengthBar password={form.password} />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    className="font-syne font-bold text-sm shadow-blue-sm"
                  >
                    Crear Cuenta
                  </Button>

                  <p className="text-[10px] text-text-secondary font-dm text-center leading-relaxed">
                    Al registrarte, aceptas nuestros{' '}
                    <span className="text-primary hover:underline cursor-pointer">Términos de Servicio</span> y{' '}
                    <span className="text-primary hover:underline cursor-pointer">Aviso de Privacidad</span>.
                  </p>
                </motion.div>
              )}

              {mode === 'recover' && (
                <motion.div
                  key="form-recover"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {recoverStep === 'email' && (
                    <div className="space-y-4">
                      <Input
                        label="Correo electrónico"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        icon={<Mail size={18} />}
                        autoComplete="email"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<ArrowRight size={18} />}
                        iconPosition="right"
                        className="font-syne font-bold text-sm shadow-blue-sm"
                      >
                        Enviar Código
                      </Button>
                    </div>
                  )}

                  {recoverStep === 'code' && (
                    <div className="space-y-4">
                      <Input
                        label="Código de validación"
                        type="text"
                        maxLength={6}
                        value={form.verificationCode}
                        onChange={handleChange('verificationCode')}
                        icon={<ShieldCheck size={18} />}
                        hint="Para la demo ingresa: 123456"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<ArrowRight size={18} />}
                        iconPosition="right"
                        className="font-syne font-bold text-sm shadow-blue-sm"
                      >
                        Verificar Código
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            addToast({ message: 'Código reenviado. Revisa tu buzón (Código: 123456) ✉️', type: 'success' });
                          }}
                          className="font-dm text-xs text-primary hover:underline font-semibold"
                        >
                          ¿No recibiste el código? Reenviar
                        </button>
                      </div>
                    </div>
                  )}

                  {recoverStep === 'reset' && (
                    <div className="space-y-4">
                      <div>
                        <Input
                          label="Nueva contraseña"
                          type="password"
                          value={form.newPassword}
                          onChange={handleChange('newPassword')}
                          icon={<Key size={18} />}
                          autoComplete="new-password"
                          required
                        />
                        <PasswordStrengthBar password={form.newPassword} />
                      </div>

                      <Input
                        label="Confirmar nueva contraseña"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        icon={<Lock size={18} />}
                        autoComplete="new-password"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<CheckCircle2 size={18} />}
                        iconPosition="right"
                        className="font-syne font-bold text-sm shadow-blue-sm"
                      >
                        Restablecer Contraseña
                      </Button>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="font-dm text-xs font-semibold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowLeft size={12} />
                      <span>Volver al inicio de sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick Demo Access (Only in Login/Register modes) */}
          {mode !== 'recover' && (
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="font-dm text-xs text-text-secondary text-center font-medium">
                ⚡ Acceso rápido de evaluación
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    name: 'Marco García',
                    email: 'marco@demo.com',
                    password: 'Demo123!'
                  }));
                  setMode('login');
                  addToast({ message: 'Credenciales demo cargadas. Presiona Iniciar Sesión 🚀', type: 'success' });
                }}
                icon={<TrendingUp size={16} />}
                className="font-syne text-xs font-bold"
              >
                Cargar Cuenta de Prueba
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
