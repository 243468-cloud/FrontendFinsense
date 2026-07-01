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
  CheckCircle2,
  Target,
  MapPin,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { login, register } from '@/services/authService';
import { getPasswordStrength } from '@/lib/utils';

type AuthMode = 'login' | 'register' | 'recover';
type RecoverStep = 'email' | 'code' | 'reset';

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

  const [isTyping, setIsTyping] = useState(false);

  const handleLoadDemo = async () => {
    if (isTyping) return;
    setIsTyping(true);
    setMode('login');
    
    setForm(prev => ({ ...prev, email: '', password: '' }));
    
    const targetEmail = 'marco@demo.com';
    const targetPassword = 'Demo123!';
    
    for (let i = 1; i <= targetEmail.length; i++) {
      await new Promise(r => setTimeout(r, 35));
      setForm(prev => ({ ...prev, email: targetEmail.slice(0, i) }));
    }
    
    await new Promise(r => setTimeout(r, 150));
    
    for (let i = 1; i <= targetPassword.length; i++) {
      await new Promise(r => setTimeout(r, 40));
      setForm(prev => ({ ...prev, password: targetPassword.slice(0, i) }));
    }
    
    await new Promise(r => setTimeout(r, 200));
    
    setIsTyping(false);
    setIsLoading(true);
    try {
      const response = await login({ email: targetEmail, password: targetPassword });
      setUser(response.user);
      addToast({ message: '¡Acceso de prueba exitoso! Bienvenido 👋', type: 'success' });
      router.push('/dashboard');
    } catch {
      addToast({ message: 'Error al iniciar sesión', type: 'error' });
      setIsLoading(false);
    }
  };

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
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface overflow-hidden relative">
      
      {/* Unified Organic Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      {/* Left Column: Brand & Features (Desktop) */}
      <div className="hidden lg:flex flex-col justify-center w-[55%] xl:w-[60%] pl-12 pr-16 xl:pl-24 xl:pr-32 z-10 py-12 relative">
        <div className="w-full max-w-2xl mx-auto flex flex-col h-full justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-blue-sm">
              <span className="text-primary font-syne font-black text-xl">FS</span>
            </div>
            <span className="text-text-primary font-syne font-bold text-3xl tracking-tight">FinSense</span>
          </div>

          <div className="flex-1 space-y-16">
            <div>
              <h2 className="font-dm font-bold text-5xl xl:text-6xl text-text-primary leading-[1.15] mb-6 tracking-tight">
                Tu dinero,<br />bajo control.
              </h2>
              <p className="font-dm text-text-secondary text-lg leading-relaxed max-w-md">
                La primera plataforma de finanzas pensada y adaptada para jóvenes y estudiantes en Chiapas.
              </p>
            </div>

            {/* Features list (Modern line icons & expansive spacing) */}
            <div className="space-y-8">
              {[
                { icon: Target, text: 'Retos de ahorro gamificados' },
                { icon: MapPin, text: 'Costo de vida en Tuxtla Gutiérrez' },
                { icon: Users, text: 'Gastos colaborativos sin fricciones' },
                { icon: ShieldCheck, text: '100% seguro sin vincular bancos' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center flex-shrink-0 border border-primary/10 shadow-sm">
                    <item.icon size={22} className="text-primary" strokeWidth={2.5} />
                  </div>
                  <p className="font-dm text-text-primary text-base font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Grouped Metrics Block */}
            <div className="flex gap-16 pt-8 border-t border-border/40">
              <div>
                <p className="font-mono font-extrabold text-4xl text-text-primary">3,500+</p>
                <p className="font-dm text-sm text-text-secondary mt-2 font-medium">Jóvenes en Tuxtla</p>
              </div>
              <div>
                <p className="font-mono font-extrabold text-4xl text-text-primary">$800</p>
                <p className="font-dm text-sm text-text-secondary mt-2 font-medium">Ahorro promedio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Expansive Form Area */}
      <div className="flex-1 w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center px-4 py-8 sm:px-6 md:px-12 relative z-20">
        
        {/* Back to Home desktop link */}
        <button 
          onClick={() => router.push('/')}
          className="hidden lg:flex items-center gap-1.5 absolute top-10 right-10 text-sm font-semibold text-text-secondary hover:text-primary transition-colors font-dm"
        >
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </button>

        {/* Widened Form Card */}
        <div className="w-full min-h-screen sm:min-h-0 sm:h-auto sm:max-w-lg bg-white/95 backdrop-blur-3xl sm:rounded-[2rem] p-6 sm:p-12 sm:border border-slate-200/60 shadow-none sm:shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative flex flex-col justify-center sm:justify-start">
          
          {/* Mobile top banner */}
          <div className="lg:hidden w-full mb-8 flex-shrink-0">
            <div 
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-3 py-4 bg-surface-2 rounded-2xl cursor-pointer border border-primary/5"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-syne font-black text-sm">FS</span>
              </div>
              <span className="font-syne font-black text-xl text-text-primary">FinSense</span>
            </div>
          </div>

          {/* Header Title with Modern Font & Transitions */}
          <div className="mb-8">
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
                  <h1 className="font-dm font-bold text-3xl sm:text-4xl text-text-primary mb-2 tracking-tight">
                    ¡Hola de nuevo! 👋
                  </h1>
                  <p className="font-dm text-text-secondary text-sm sm:text-base">
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
                  <h1 className="font-dm font-bold text-3xl sm:text-4xl text-text-primary mb-2 tracking-tight">
                    Crea tu cuenta
                  </h1>
                  <p className="font-dm text-text-secondary text-sm sm:text-base">
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
                  <div className="flex items-center gap-2 mb-2">
                    <button 
                      onClick={handleBackStep} 
                      className="text-text-secondary hover:text-primary transition-colors p-1.5 -ml-1.5 rounded-full hover:bg-surface-2"
                      aria-label="Volver al paso anterior"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-dm font-bold text-3xl text-text-primary tracking-tight">
                      {recoverStep === 'email' && 'Recuperar Cuenta'}
                      {recoverStep === 'code' && 'Validar Código'}
                      {recoverStep === 'reset' && 'Nueva Contraseña'}
                    </h1>
                  </div>
                  <p className="font-dm text-text-secondary text-sm sm:text-base">
                    {recoverStep === 'email' && 'Ingresa tu correo para recibir el código de validación.'}
                    {recoverStep === 'code' && 'Ingresa el código de 6 dígitos enviado a tu correo.'}
                    {recoverStep === 'reset' && 'Ingresa una nueva contraseña segura para restablecer tu cuenta.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refined Tab Toggle */}
          <AnimatePresence>
            {mode !== 'recover' && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-2 rounded-[1.25rem] p-1.5 flex border border-primary/5"
              >
                {(['login', 'register'] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    className="flex-1 py-3 text-sm font-dm font-semibold rounded-xl transition-all duration-200 relative"
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    <span className={mode === m ? 'text-primary relative z-10 font-bold' : 'text-text-secondary relative z-10'}>
                      {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </span>
                    {mode === m && (
                      <motion.div
                        layoutId="auth-active-tab"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-primary/5"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="form-login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <Input
                    label="Correo electrónico"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    icon={<Mail size={20} />}
                    autoComplete="email"
                    required
                  />

                  <div>
                    <Input
                      label="Contraseña"
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      icon={<Lock size={20} />}
                      autoComplete="current-password"
                      required
                    />
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('recover');
                          setRecoverStep('email');
                        }}
                        className="font-dm text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={isLoading || isTyping}
                      icon={<ArrowRight size={20} />}
                      iconPosition="right"
                      className="font-dm font-semibold text-base shadow-blue-sm bg-gradient-to-r from-primary-dark to-primary border border-primary-dark/30 hover:from-primary hover:to-primary-light hover:border-primary/30"
                    >
                      Iniciar sesión
                    </Button>
                  </div>
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
                  className="space-y-5"
                >
                  {/* Trust Banner - Integrated */}
                  <div className="bg-surface-2 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
                    <ShieldCheck size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="font-dm text-sm text-text-secondary leading-relaxed">
                        <strong className="font-bold text-text-primary">100% Seguro:</strong> Administra tus finanzas de forma privada. Nunca requerimos contraseñas bancarias.
                      </p>
                    </div>
                  </div>

                  <Input
                    label="Nombre completo"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    icon={<User size={20} />}
                    autoComplete="name"
                    required
                  />

                  <Input
                    label="Correo electrónico"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    icon={<Mail size={20} />}
                    autoComplete="email"
                    required
                  />

                  <div>
                    <Input
                      label="Contraseña"
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      icon={<Lock size={20} />}
                      autoComplete="new-password"
                      required
                    />
                    <PasswordStrengthBar password={form.password} />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={isLoading}
                      icon={<ArrowRight size={20} />}
                      iconPosition="right"
                      className="font-dm font-semibold text-base shadow-blue-sm bg-gradient-to-r from-primary-dark to-primary border border-primary-dark/30 hover:from-primary hover:to-primary-light hover:border-primary/30"
                    >
                      Crear cuenta
                    </Button>
                  </div>

                  <p className="text-xs text-text-secondary font-dm text-center leading-relaxed">
                    Al registrarte, aceptas nuestros{' '}
                    <span className="text-primary hover:underline cursor-pointer font-medium">Términos de Servicio</span> y{' '}
                    <span className="text-primary hover:underline cursor-pointer font-medium">Aviso de Privacidad</span>.
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
                  className="space-y-5"
                >
                  {recoverStep === 'email' && (
                    <div className="space-y-5">
                      <Input
                        label="Correo electrónico"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        icon={<Mail size={20} />}
                        autoComplete="email"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<ArrowRight size={20} />}
                        iconPosition="right"
                        className="font-dm font-semibold text-base shadow-blue-sm bg-gradient-to-r from-primary-dark to-primary border border-primary-dark/30 hover:from-primary hover:to-primary-light hover:border-primary/30"
                      >
                        Enviar Código
                      </Button>
                    </div>
                  )}

                  {recoverStep === 'code' && (
                    <div className="space-y-5">
                      <Input
                        label="Código de validación"
                        type="text"
                        maxLength={6}
                        value={form.verificationCode}
                        onChange={handleChange('verificationCode')}
                        icon={<ShieldCheck size={20} />}
                        hint="Para la demo ingresa: 123456"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<ArrowRight size={20} />}
                        iconPosition="right"
                        className="font-dm font-semibold text-base shadow-blue-sm bg-gradient-to-r from-primary-dark to-primary border border-primary-dark/30 hover:from-primary hover:to-primary-light hover:border-primary/30"
                      >
                        Verificar Código
                      </Button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            addToast({ message: 'Código reenviado. Revisa tu buzón (Código: 123456) ✉️', type: 'success' });
                          }}
                          className="font-dm text-sm text-primary hover:underline font-semibold"
                        >
                          ¿No recibiste el código? Reenviar
                        </button>
                      </div>
                    </div>
                  )}

                  {recoverStep === 'reset' && (
                    <div className="space-y-5">
                      <div>
                        <Input
                          label="Nueva contraseña"
                          type="password"
                          value={form.newPassword}
                          onChange={handleChange('newPassword')}
                          icon={<Key size={20} />}
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
                        icon={<Lock size={20} />}
                        autoComplete="new-password"
                        required
                      />

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isLoading}
                        icon={<CheckCircle2 size={20} />}
                        iconPosition="right"
                        className="font-dm font-semibold text-base shadow-blue-sm bg-gradient-to-r from-primary-dark to-primary border border-primary-dark/30 hover:from-primary hover:to-primary-light hover:border-primary/30"
                      >
                        Restablecer contraseña
                      </Button>
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="font-dm text-sm font-semibold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} />
                      <span>Volver al inicio de sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick Demo Access */}
          {mode !== 'recover' && (
            <div className="mt-8 pt-8 border-t border-border/60">
              <Button
                variant="ghost"
                fullWidth
                onClick={handleLoadDemo}
                disabled={isTyping}
                icon={<TrendingUp size={18} />}
                className="font-dm text-sm font-semibold bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary border-none shadow-none h-12"
              >
                Cargar cuenta de prueba
              </Button>
            </div>
          )}

          {/* Mobile support link */}
          <div className="mt-8 text-center sm:hidden">
            <a href="mailto:soporte@finsense.mx" className="text-sm text-text-secondary hover:text-primary transition-colors font-dm font-medium">
              ¿Necesitas ayuda? Contactar a soporte
            </a>
          </div>
        </div>
      </div>

      {/* Global Footer (Centered at bottom) */}
      <div className="absolute bottom-6 w-full text-center z-10 hidden lg:block pointer-events-none">
        <p className="font-dm text-text-secondary/60 text-sm">
          © 2026 FinSense · Universidad Politécnica de Chiapas
        </p>
      </div>

    </div>
  );
}
