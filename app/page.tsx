'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
 ArrowRight, 
 MapPin, 
 Trophy, 
 Users, 
 Star, 
 ChevronRight, 
 ShieldCheck, 
 Check, 
 X, 
 Sparkles,
 Smartphone,
 Flame,
 PieChart,
 ArrowUpRight,
 Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createRipple, getIconForEmoji } from '@/lib/utils';

// ─── Letter-by-letter animation for hero title ───
function AnimatedTitle({ text }: { text: string }) {
 const words = text.split(' ');
 return (
 <motion.h1
 className="font-syne font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-primary leading-tight tracking-tight"
 initial="hidden"
 animate="visible"
 variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
 >
 {words.map((word, wi) => (
 <span key={wi} className="inline-block mr-3">
 {word.split('').map((char, ci) => (
 <motion.span
 key={ci}
 className="inline-block"
 variants={{
 hidden: { opacity: 0, y: 15, rotateX: -60 },
 visible: { opacity: 1, y: 0, rotateX: 0 },
 }}
 transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
 >
 {char}
 </motion.span>
 ))}
 </span>
 ))}
 </motion.h1>
 );
}

export default function LandingPage() {
 const router = useRouter();
 const containerRef = useRef<HTMLDivElement>(null);
 
 // PWA installation hooks
 const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
 const [isInstallable, setIsInstallable] = useState(false);
 const [showInstallModal, setShowInstallModal] = useState(false);
 
 // Interactive mockup states
 const [mockupStreak, setMockupStreak] = useState(6);
 const [mockupBalance, setMockupBalance] = useState(1450);
 const [mockupXP, setMockupXP] = useState(450);

 const { scrollYProgress } = useScroll({ container: containerRef });
 const geoY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

 useEffect(() => {
 const handleBeforeInstallPrompt = (e: any) => {
 e.preventDefault();
 setDeferredPrompt(e);
 setIsInstallable(true);
 };

 window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

 if (window.matchMedia('(display-mode: standalone)').matches) {
 setIsInstallable(false);
 }

 return () => {
 window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
 };
 }, []);

 const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
 createRipple(e);
 router.push('/auth');
 };

 const handleInstall = async () => {
 if (!deferredPrompt) {
 setShowInstallModal(true);
 return;
 }
 deferredPrompt.prompt();
 const { outcome } = await deferredPrompt.userChoice;
 if (outcome === 'accepted') {
 setIsInstallable(false);
 setDeferredPrompt(null);
 }
 };

 const incrementStreak = () => {
 setMockupStreak(prev => prev + 1);
 setMockupXP(prev => prev + 50);
 setMockupBalance(prev => prev + 100);
 };

 const features = [
 {
 id: 'local',
 icon: MapPin,
 title: 'Contexto Real de Chiapas',
 description: 'Compara tus gastos reales con el costo de vida promedio de Tuxtla Gutiérrez. ¿Pagas más o menos en transporte o comida de lo habitual?',
 color: '#FF6B6B',
 bgColor: '#FFF0F0',
 },
 {
 id: 'goals',
 icon: Flame,
 title: 'Finanzas Gamificadas',
 description: 'Ahorrar ya no es aburrido. Supera retos de ahorro semanales, acumula XP y desbloquea medallas y rachas coleccionables.',
 color: '#0057FF',
 bgColor: '#F0F5FF',
 },
 {
 id: 'groups',
 icon: Users,
 title: 'Modo Colaborativo',
 description: 'Registra y divide los gastos con tus compañeros de casa, amigos en salidas o pareja de forma automática. Olvídate de los chats molestos de WhatsApp.',
 color: '#00C896',
 bgColor: '#F0FFF9',
 },
 {
 id: 'privacy',
 icon: Lock,
 title: 'Privacidad y Autonomía',
 description: 'Controla tu dinero en efectivo y cuentas sin vincular tu cuenta bancaria. Seguridad completa y autonomía total para estudiantes y freelancers.',
 color: '#FFB800',
 bgColor: '#FFFBEB',
 },
 ];

 return (
 <div
 ref={containerRef}
 className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-white via-surface-2 to-surface-3"
 >
 {/* Decorative Geometric Shapes */}
 <motion.div
 style={{ y: geoY }}
 className="absolute inset-0 pointer-events-none overflow-hidden"
 aria-hidden="true"
 >
 <div className="geo-circle w-[600px] h-[600px] -top-80 -right-80 opacity-40 bg-gradient-to-br from-primary/10 to-accent/10" />
 <div className="geo-circle w-[400px] h-[400px] top-[40%] -left-48 opacity-30 bg-gradient-to-tr from-accent/10 to-success/10" />
 <div
 className="geo-hex w-[250px] h-[250px] top-1/4 right-[10%] opacity-20"
 style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.15) 0%, rgba(0,87,255,0.08) 100%)' }}
 />
 <div
 className="geo-hex w-[180px] h-[180px] bottom-1/3 left-[15%] opacity-15"
 style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.15) 0%, rgba(0,87,255,0.08) 100%)' }}
 />
 </motion.div>

 {/* ─── 1. Header / Barra de Navegación ─── */}
 <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
 {/* Left: Logo & Isotipo */}
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-blue-sm hover:scale-105 transition-transform duration-200 cursor-pointer">
 <span className="text-white font-syne font-black text-base tracking-wider">FS</span>
 </div>
 <span className="font-syne font-black text-2xl text-text-primary tracking-tight">
 FinSense
 </span>
 </div>

 {/* Center (Desktop only) */}
 <nav className="hidden md:flex items-center gap-8">
 <a href="#features" className="font-dm font-medium text-sm text-text-secondary hover:text-primary transition-colors">
 Características
 </a>
 <a href="#comparativa" className="font-dm font-medium text-sm text-text-secondary hover:text-primary transition-colors">
 Comparativa
 </a>
 <a href="#comunidad" className="font-dm font-medium text-sm text-text-secondary hover:text-primary transition-colors">
 Comunidad Local
 </a>
 </nav>

 {/* Right: Auth CTAs */}
 <div className="flex items-center gap-4">
 <button
 onClick={() => router.push('/auth')}
 className="hidden sm:inline-block font-dm font-semibold text-sm text-text-secondary hover:text-primary transition-colors"
 >
 Iniciar sesión
 </button>
 <Button
 size="sm"
 onClick={handleStart}
 className="font-syne text-xs sm:text-sm font-bold shadow-blue-sm"
 >
 Registrarse
 </Button>
 </div>
 </div>
 </header>

 {/* ─── 2. Hero Section ─── */}
 <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pt-16 md:pb-28">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
 
 {/* Left Column: Title, Subtitle, CTA buttons */}
 <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
 {/* City badge */}
 <motion.div
 className="inline-flex items-center gap-2 bg-surface border border-primary/20 rounded-full px-4 py-2 shadow-blue-sm"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 >
 <MapPin size={14} className="text-primary animate-bounce" />
 <span className="font-dm text-xs sm:text-sm text-text-secondary font-medium">
 Diseñado para jóvenes en{' '}
 <span className="font-bold text-primary">Chiapas</span>
 </span>
 </motion.div>

 {/* Title */}
 <AnimatedTitle text="Toma el control de tu dinero." />
 <motion.h2 
 className="font-syne font-bold text-xl sm:text-2xl text-primary mt-1"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.6 }}
 >
 A tu propio ritmo y con contexto local.
 </motion.h2>

 {/* Subtitle */}
 <motion.p
 className="font-dm text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8, duration: 0.5 }}
 >
 La plataforma inteligente para gestionar tus finanzas personales, ahorrar con retos gamificados y compartir gastos con amigos.{' '}
 <strong className="text-text-primary font-bold">100% autónoma y sin vincular tus cuentas bancarias.</strong>
 </motion.p>

 {/* CTA Buttons */}
 <motion.div
 className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1, duration: 0.5 }}
 >
 <Button
 size="lg"
 onClick={handleStart}
 icon={<ArrowRight size={20} />}
 iconPosition="right"
 className="font-syne text-sm sm:text-base font-bold"
 >
 Comenzar Gratis
 </Button>
 <Button
 size="lg"
 variant="secondary"
 onClick={handleInstall}
 icon={<Smartphone size={20} />}
 className="font-syne text-sm sm:text-base font-bold"
 >
 Instalar App
 </Button>
 </motion.div>

 {/* Social proof */}
 <motion.div
 className="flex items-center gap-3 justify-center lg:justify-start pt-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1.2 }}
 >
 <div className="flex -space-x-2">
 {['🧑‍🎓', '👩‍💻', '🧑‍🎨', '👨‍💼'].map((emoji, i) => (
 <div
 key={i}
 className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-2 to-surface-3 border-2 border-white flex items-center justify-center text-sm shadow-blue-sm"
 >
 {emoji}
 </div>
 ))}
 </div>
  <p className="font-dm text-xs sm:text-sm text-text-secondary">
  <span className="font-bold text-text-primary">Diseñado</span> para estudiantes de la{' '}
  <span className="font-semibold text-primary">UP Chiapas</span>.
  </p>
 </motion.div>
 </div>

 {/* Right Column: Premium Interactive CSS Dashboard Mockup */}
 <div className="lg:col-span-5 flex justify-center lg:justify-end">
 <motion.div
 className="relative w-full max-w-[340px] bg-slate-950 rounded-[40px] p-3 shadow-blue-lg border-[6px] border-slate-800/90 aspect-[9/19] overflow-hidden flex flex-col justify-between"
 initial={{ opacity: 0, y: 30, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.5, duration: 0.8 }}
 >
 {/* Phone Speaker & Camera Notch */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800/90 rounded-b-2xl z-20 flex justify-center items-center">
 <div className="w-12 h-1.5 bg-slate-900 rounded-full" />
 <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-4" />
 </div>

 {/* Live Wallpaper Glow */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,87,255,0.15),transparent_60%)] pointer-events-none" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,200,150,0.1),transparent_60%)] pointer-events-none" />

 {/* Main Content inside Mock Phone */}
 <div className="flex-1 flex flex-col pt-8 pb-4 px-3 gap-4 overflow-y-auto scroll-x-hidden text-white font-dm">
 
 {/* Header Widget */}
 <div className="flex justify-between items-center bg-surface/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
 <div>
 <p className="text-[10px] text-white/50">Hola, Carlos 👋</p>
 <p className="text-xs font-bold font-syne">Nivel 3: Ahorrador</p>
 </div>
 <div className="bg-primary/20 text-primary-light text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/30">
 {mockupXP} XP
 </div>
 </div>

 {/* Balance Widget */}
 <div className="bg-gradient-to-r from-blue-600/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative overflow-hidden">
 <p className="text-[10px] text-white/60">Mi Balance Estimado</p>
 <p className="text-xl font-bold font-mono tracking-tight text-white mt-1">
 ${mockupBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
 </p>
 <div className="flex items-center gap-1.5 text-[9px] text-success mt-2">
 <Sparkles size={10} />
 <span>Ahorro inteligente activo</span>
 </div>
 </div>

 {/* Tap to Streak - Interactivo */}
 <motion.div
 whileTap={{ scale: 0.97 }}
 onClick={incrementStreak}
 className="bg-surface/5 hover:bg-surface/10 border border-white/10 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors duration-200"
 >
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 animate-pulse">
 <Flame size={18} fill="currentColor" />
 </div>
 <div>
 <p className="text-xs font-bold">Racha Activa</p>
 <p className="text-[10px] text-white/50">¡Haz clic para ahorrar $100!</p>
 </div>
 </div>
 <span className="font-syne font-black text-lg text-orange-400">{mockupStreak} Días</span>
 </motion.div>

 {/* Benchmark Local Widget */}
 <div className="bg-surface/5 rounded-2xl p-3 border border-white/10 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-semibold text-white/70 flex items-center gap-1">
 <MapPin size={10} className="text-accent" /> Tuxtla Gutiérrez
 </span>
 <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded font-bold">Local</span>
 </div>
 <p className="text-xs text-white/90">
 Tu gasto en comida esta semana es <span className="text-success font-bold font-mono">15% menor</span> que el promedio universitario.
 </p>
 <div className="h-2 w-full bg-surface/10 rounded-full overflow-hidden">
 <div className="h-full w-[45%] bg-success rounded-full" />
 </div>
 </div>

 {/* Active Group Split Card */}
 <div className="bg-surface/5 rounded-2xl p-3 border border-white/10 space-y-2.5">
 <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
 <span className="flex items-center gap-1"><Users size={10} /> Roomies de Renta</span>
 <span className="text-yellow-500">Pendiente</span>
 </div>
 <div className="flex justify-between items-center bg-surface/5 p-2 rounded-xl border border-white/5">
 <div>
 <p className="text-[10px] text-white/90">Dividir: Internet Junio</p>
 <p className="text-[9px] text-white/50">Dividido entre 3 personas</p>
 </div>
 <p className="text-xs font-bold text-accent font-mono">$83.33</p>
 </div>
 </div>

 {/* Autonomy Badge */}
 <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-2.5 flex items-center gap-2">
 <Lock size={12} className="text-yellow-500" />
 <p className="text-[9px] text-yellow-500/90 leading-tight">
 100% Autónomo. Sin vinculación bancaria.
 </p>
 </div>

 </div>

 {/* Home Indicator */}
 <div className="w-24 h-1 bg-surface/20 rounded-full mx-auto mb-2" />
 </motion.div>
 </div>
 </div>
 </section>

 {/* ─── 3. Propuesta de Valor (Features Grid) ─── */}
 <section id="features" className="relative z-10 py-20 bg-surface border-y border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Header */}
 <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
 <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
 ¿Qué nos diferencia de la competencia?
 </h2>
 <p className="font-dm text-base sm:text-lg text-text-secondary leading-relaxed">
 Diseñamos FinSense pensando en las verdaderas necesidades locales de los estudiantes y trabajadores independientes, alejándonos de los esquemas financieros extranjeros o tradicionales.
 </p>
 </div>

 {/* Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {features.map((feature, i) => (
 <motion.article
 key={feature.id}
 className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between h-full relative overflow-hidden group hover:border-primary/20"
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1, duration: 0.5 }}
 viewport={{ once: true }}
 whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0, 87, 255, 0.12)' }}
 >
 <div>
 <div
 className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
 style={{ backgroundColor: feature.bgColor }}
 >
  <feature.icon size={22} style={{ color: feature.color }} />
 </div>
 <h3 className="font-syne font-bold text-lg sm:text-xl text-text-primary mb-3 group-hover:text-primary transition-colors">
 {feature.title}
 </h3>
 <p className="font-dm text-sm text-text-secondary leading-relaxed">
 {feature.description}
 </p>
 </div>

 <div className="mt-6 flex items-center text-xs font-semibold text-primary gap-1 group-hover:gap-2 transition-all duration-200">
 <span>Conocer más</span>
 <ChevronRight size={14} />
 </div>
 </motion.article>
 ))}
 </div>
 </div>
 </section>

 {/* ─── 4. Tabla Comparativa Directa ─── */}
 <section id="comparativa" className="relative z-10 py-20 bg-surface-2/30">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Header */}
 <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
 <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
 ¿Por qué elegir FinSense?
 </h2>
 <p className="font-dm text-base sm:text-lg text-text-secondary">
 Compara directamente y comprende la diferencia entre la rigidez tradicional y la autonomía adaptada a ti.
 </p>
 </div>

 {/* Table Container */}
 <div className="max-w-4xl mx-auto bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-3/50 border-b border-border">
 <th className="p-4 sm:p-6 font-syne font-bold text-sm text-text-primary">Característica</th>
 <th className="p-4 sm:p-6 font-syne font-bold text-sm text-text-secondary">Apps Tradicionales</th>
 <th className="p-4 sm:p-6 font-syne font-bold text-sm text-primary bg-primary/5">FinSense</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border font-dm text-sm">
 <tr>
 <td className="p-4 sm:p-6 font-semibold text-text-primary">Vinculación Bancaria</td>
 <td className="p-4 sm:p-6 text-text-secondary">Obligatoria y rígida (excluye efectivo)</td>
 <td className="p-4 sm:p-6 text-primary font-semibold bg-primary/5">
 <span className="flex items-center gap-2">
 <Check size={16} className="text-success" /> 100% autónomo (ideal para efectivo)
 </span>
 </td>
 </tr>
 <tr>
 <td className="p-4 sm:p-6 font-semibold text-text-primary">Contexto de Gastos</td>
 <td className="p-4 sm:p-6 text-text-secondary">Gráficas e índices generales en dólares</td>
 <td className="p-4 sm:p-6 text-primary font-semibold bg-primary/5">
 <div className="flex items-center gap-2">
 <Check size={16} className="text-success" /> Comparativas en tu ciudad (Tuxtla)
 </div>
 </td>
 </tr>
 <tr>
 <td className="p-4 sm:p-6 font-semibold text-text-primary">Gestión de Gastos</td>
 <td className="p-4 sm:p-6 text-text-secondary">Solo uso individual o registro complejo</td>
 <td className="p-4 sm:p-6 text-primary font-semibold bg-primary/5">
 <span className="flex items-center gap-2">
 <Check size={16} className="text-success" /> Modo colaborativo integrado
 </span>
 </td>
 </tr>
 <tr>
 <td className="p-4 sm:p-6 font-semibold text-text-primary">Diseño e Interfaz</td>
 <td className="p-4 sm:p-6 text-text-secondary">Aburrido, en inglés, lleno de tecnicismos</td>
 <td className="p-4 sm:p-6 text-primary font-semibold bg-primary/5">
 <span className="flex items-center gap-2">
 <Check size={16} className="text-success" /> Diseño simple adaptado y gamificado
 </span>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </section>

 {/* ─── 5. Enfoque Comunitario / Público Objetivo ─── */}
 <section id="comunidad" className="relative z-10 py-20 bg-surface border-y border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
 {/* Header */}
 <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
 <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
 Diseñado para la realidad local
 </h2>
 <p className="font-dm text-base sm:text-lg text-text-secondary leading-relaxed">
 Damos respuesta a las particularidades financieras que enfrentan los jóvenes en Chiapas.
 </p>
 </div>

 {/* Target Audience Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {/* Target Card 1 */}
 <div className="bg-surface-2/40 rounded-3xl p-8 border border-border space-y-4 hover:bg-surface-2/70 transition-colors flex flex-col">
 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
 {(() => {
 const Icon = getIconForEmoji('🎓');
 return <Icon size={24} />;
 })()}
 </div>
 <h3 className="font-syne font-bold text-xl text-text-primary pt-1">Estudiantes Universitarios</h3>
 <p className="font-dm text-sm text-text-secondary leading-relaxed">
 Controla los ingresos variables o apoyos familiares. Optimiza tus presupuestos para transporte, comidas y materiales de la universidad sin perder el control ni quedar en ceros.
 </p>
 </div>

 {/* Target Card 2 */}
 <div className="bg-surface-2/40 rounded-3xl p-8 border border-border space-y-4 hover:bg-surface-2/70 transition-colors flex flex-col">
 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
 {(() => {
 const Icon = getIconForEmoji('💼');
 return <Icon size={24} />;
 })()}
 </div>
 <h3 className="font-syne font-bold text-xl text-text-primary pt-1">Freelancers / Profesionistas</h3>
 <p className="font-dm text-sm text-text-secondary leading-relaxed">
 Organiza tu economía y flujos de efectivo variables de forma independiente. Sin necesidad de utilizar hojas de cálculo confusas o contratar contadores para finanzas del día a día.
 </p>
 </div>

 {/* Target Card 3 */}
 <div className="bg-surface-2/40 rounded-3xl p-8 border border-border space-y-4 hover:bg-surface-2/70 transition-colors flex flex-col">
 <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success flex-shrink-0">
 {(() => {
 const Icon = getIconForEmoji('👥');
 return <Icon size={24} />;
 })()}
 </div>
 <h3 className="font-syne font-bold text-xl text-text-primary pt-1">Parejas y Amigos</h3>
 <p className="font-dm text-sm text-text-secondary leading-relaxed">
 Coordinen la renta de departamentos compartidos (roomies), compras de despensa o gastos de salidas grupales sin notas de papel ni reclamos incómodos por WhatsApp.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* ─── 6. Final CTA ─── */}
 <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
 <motion.div
 className="bg-gradient-accent rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-blue-lg"
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 viewport={{ once: true }}
 >
 {/* Decorative circles */}
 <div className="absolute -top-12 -right-12 w-48 h-48 bg-surface/10 rounded-full pointer-events-none" />
 <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-surface/10 rounded-full pointer-events-none" />

 <div className="relative z-10 max-w-2xl mx-auto space-y-6">
 <div className="flex justify-center gap-1" aria-hidden="true">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={20} className="text-yellow-300 fill-yellow-300 animate-pulse" />
 ))}
 </div>
 <h2 className="font-syne font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
 ¿Listo para transformar tu relación con el dinero?
 </h2>
 <p className="font-dm text-sm sm:text-base text-white/90">
 Crea tu cuenta en un minuto y descubre un método autónomo, local y gamificado para lograr tus metas de ahorro.
 </p>
 <div className="pt-2">
 <Button
 variant="outline"
 size="lg"
 onClick={handleStart}
 className="bg-surface text-primary border-white hover:bg-surface-2 hover:text-primary font-syne font-bold shadow-md transform hover:scale-[1.02] transition-all"
 >
 Crea tu cuenta en un minuto
 </Button>
 </div>
 </div>
 </motion.div>
 </section>

 {/* ─── 7. Footer / Pie de Página ─── */}
 <footer className="relative z-10 bg-slate-950 text-white py-12 sm:py-16 border-t border-slate-900">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
 
 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:items-center">
 {/* Left Brand */}
 <div className="md:col-span-4 space-y-3">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-syne font-black text-xs text-white">
 FS
 </div>
 <span className="font-syne font-bold text-lg">FinSense</span>
 </div>
 <p className="font-dm text-xs text-white/50">
 La plataforma inteligente para tomar el control de tu economía en Chiapas.
 </p>
 </div>

 {/* UP Chiapas Credits */}
 <div className="md:col-span-5 text-left md:text-center text-xs text-white/60 leading-relaxed font-dm">
 <span className="font-bold text-white block sm:inline">Proyecto Desarrollado por estudiantes de la: </span>
 Universidad Politécnica de Chiapas - Ingeniería en Tecnologías de la Información e Innovación Digital.
 </div>

 {/* Secondary Links */}
 <div className="md:col-span-3 flex md:justify-end gap-6 text-xs font-dm text-white/50">
 <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
 <a href="#" className="hover:text-white transition-colors">Términos</a>
 <a href="#" className="hover:text-white transition-colors">Documentación</a>
 </div>
 </div>

 <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-white/40 gap-4">
 <p>© {new Date().getFullYear()} FinSense. Todos los derechos reservados.</p>
 <p>Diseñado para entornos PWA (Aprovechamiento Mobile-First).</p>
 </div>
 </div>
 </footer>

 {/* ─── PWA Instructions Modal ─── */}
 {showInstallModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="bg-surface rounded-3xl p-6 max-w-sm w-full border border-border shadow-blue-lg relative"
 >
 <button
 onClick={() => setShowInstallModal(false)}
 className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
 aria-label="Cerrar"
 >
 <X size={20} />
 </button>

 <div className="space-y-4">
 <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
 📱
 </div>
 <div>
 <h3 className="font-syne font-bold text-lg text-text-primary">Instalar FinSense PWA</h3>
 <p className="font-dm text-xs sm:text-sm text-text-secondary mt-1">
 Agrega FinSense a tu pantalla de inicio para acceder de forma rápida y sin conexión, como una app nativa.
 </p>
 </div>

 <div className="space-y-3 pt-2">
 <div className="flex gap-3 items-start bg-surface-2 p-3 rounded-xl border border-primary/10">
 <span className="text-xl">🤖</span>
 <div>
 <h4 className="font-semibold text-xs text-text-primary">En Android (Chrome / Edge)</h4>
 <p className="text-[11px] text-text-secondary leading-relaxed">
 Presiona los tres puntos superiores <span className="font-bold">⋮</span> y luego selecciona <span className="font-bold">"Instalar aplicación"</span>.
 </p>
 </div>
 </div>
 <div className="flex gap-3 items-start bg-surface-2 p-3 rounded-xl border border-primary/10">
 <span className="text-xl">🍏</span>
 <div>
 <h4 className="font-semibold text-xs text-text-primary">En iOS / iPhone (Safari)</h4>
 <p className="text-[11px] text-text-secondary leading-relaxed">
 Presiona el botón de <span className="font-bold">Compartir ↑</span> abajo en Safari y selecciona <span className="font-bold">"Añadir a pantalla de inicio"</span>.
 </p>
 </div>
 </div>
 </div>

 <Button
 variant="primary"
 fullWidth
 className="mt-4 font-syne font-bold"
 onClick={() => setShowInstallModal(false)}
 >
 Entendido
 </Button>
 </div>
 </motion.div>
 </div>
 )}
 </div>
 );
}
