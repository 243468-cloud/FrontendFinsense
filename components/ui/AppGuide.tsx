'use client';
import { useEffect, useState } from 'react';
import { Joyride, Step, TooltipRenderProps, STATUS, EventData, EVENTS, ACTIONS } from 'react-joyride';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

// Custom Tooltip Component for the Guided Tour
const CustomTooltip = ({
  index,
  step,
  skipProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  // Map steps to specific dog images
  let dogImage = '/guide/dog-normal.jpeg'; // Fallback
  if (index === 0) dogImage = '/guide/dog-normal.jpeg'; // Header (Dashboard)
  if (index === 1) dogImage = '/guide/dog-point.jpeg'; // Analytics (Analytics view)
  if (index === 2) dogImage = '/guide/dog-thumbsup.jpeg'; // Investments (Investments view)
  if (index === 3) dogImage = '/guide/dog-normal.jpeg'; // Store (Store view)
  if (index === 4) dogImage = '/guide/dog-arms.jpeg'; // AI Bot (Dashboard)
  
  return (
    <div {...tooltipProps} className="max-w-xs sm:max-w-md w-full bg-transparent flex flex-col items-center">
      <div className="flex flex-row items-end gap-2 w-full drop-shadow-xl">
        {/* Mascot Image */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 z-10 mb-[-10px] ml-2">
          <img 
            src={dogImage} 
            alt="Dog Guide" 
            className="w-full h-full object-contain drop-shadow-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Guide&backgroundColor=transparent';
            }}
          />
        </div>
        
        {/* Chat Bubble */}
        <div 
          className="relative bg-surface border-2 border-primary rounded-2xl p-4 sm:p-5 shadow-blue-lg flex-1 z-20 mb-4 transition-all duration-300 animate-in fade-in slide-in-from-left-4"
        >
          {/* Arrow pointing to dog */}
          <div className="absolute -left-3 bottom-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-primary border-b-[10px] border-b-transparent"></div>
          <div className="absolute -left-2 bottom-[25px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-surface border-b-[8px] border-b-transparent"></div>
          
          {step.title && (
            <h3 className="font-syne font-bold text-base sm:text-lg text-primary mb-1">
              {step.title}
            </h3>
          )}
          <div className="font-dm text-sm text-text-primary mb-4 leading-relaxed">
            {step.content}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            {!isLastStep ? (
              <button 
                {...skipProps} 
                className="text-text-secondary hover:text-text-primary text-xs font-dm transition-colors"
              >
                Saltar tour
              </button>
            ) : (
              <div />
            )}
            
            <button 
              {...primaryProps} 
              className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg font-dm font-bold text-sm shadow-sm transition-transform active:scale-95"
            >
              {isLastStep ? '¡Entendido!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extended Steps with routes (moved outside to prevent re-renders)
const TOUR_STEPS: (Step & { route: string })[] = [
  {
    target: '.tour-dashboard-header',
    route: '/dashboard',
    title: '¡Bienvenido a FinSense!',
    content: '¡Guau! Soy tu guía financiero personal. Empezaremos viendo tu Dashboard, aquí verás tu nivel y notificaciones.',
    placement: 'bottom',
  },
  {
    target: '.tour-analytics-header',
    route: '/analytics',
    title: 'Analíticas Detalladas',
    content: 'Mira tus gráficas. Aquí podrás ver exactamente en qué se te va el dinero y controlar tus gastos.',
    placement: 'bottom',
  },
  {
    target: '.tour-investments-header',
    route: '/investments',
    title: 'Tus Inversiones',
    content: '¡Haz que tu dinero trabaje! Aquí puedes llevar el control de tus portafolios y simular intereses compuestos.',
    placement: 'bottom',
  },
  {
    target: '.tour-store-header',
    route: '/store',
    title: '¡Gasta tus FinCoins!',
    content: 'Usa las monedas que ganas ahorrando para comprar temas visuales y avatares para personalizar tu app.',
    placement: 'bottom',
  },
  {
    target: '.tour-budgets-header',
    route: '/budgets',
    title: 'Tus Presupuestos',
    content: 'Controla tus límites de gastos por categoría para evitar sorpresas a fin de mes.',
    placement: 'bottom',
  },
  {
    target: '.tour-subscriptions-header',
    route: '/subscriptions',
    title: 'Tus Suscripciones',
    content: 'Descubre y gestiona tus pagos recurrentes para identificar posibles fugas de dinero.',
    placement: 'bottom',
  },
  {
    target: '.tour-goals-header',
    route: '/goals',
    title: 'Metas de Ahorro',
    content: 'Fija objetivos claros y observa cómo crecen tus ahorros con nuestra ayuda inteligente.',
    placement: 'bottom',
  },
  {
    target: '.tour-groups-header',
    route: '/groups',
    title: 'Grupos Compartidos',
    content: 'Organiza gastos compartidos con tus amigos o familiares y mantengan cuentas claras.',
    placement: 'bottom',
  },
  {
    target: '.tour-ai-bot',
    route: '/dashboard',
    title: 'Tu Asesor Inteligente',
    content: '¿Tienes Dudas? Yo y la IA estamos aquí. Pregúntame sobre tus gastos o pídeme consejos dando clic en este botón. ¡Disfruta FinSense!',
    placement: 'top-start',
  }
];

export function AppGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasSeenTour, setHasSeenTour, tourStepIndex, setTourStepIndex } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [run, setRun] = useState(false);

  // Determine if we are on a public (non-app) route
  const isPublicRoute = !pathname || pathname === '/' || pathname.startsWith('/auth');

  useEffect(() => {
    // Only run the tour when the user is authenticated and inside the app
    if (!hasSeenTour && isAuthenticated && !isPublicRoute) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, isAuthenticated, isPublicRoute]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, action, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setHasSeenTour(true);
      setRun(false);
      setTourStepIndex(0);
      return;
    }

    // Handle navigation
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      if (nextStepIndex >= TOUR_STEPS.length) {
        setHasSeenTour(true);
        setRun(false);
        setTourStepIndex(0);
        return;
      }

      // Safety bounds
      if (nextStepIndex >= 0 && nextStepIndex < TOUR_STEPS.length) {
        const nextRoute = TOUR_STEPS[nextStepIndex].route;
        
        if (pathname !== nextRoute) {
          // Pause the tour momentarily to allow router to navigate
          setRun(false);
          router.push(nextRoute);
          
          // Resume tour on the new page
          setTimeout(() => {
            setTourStepIndex(nextStepIndex);
            setRun(true);
          }, 800);
        } else {
          setTourStepIndex(nextStepIndex);
        }
      }
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      stepIndex={tourStepIndex}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(10, 17, 40, 0.75)',
        },
      } as any}
    />
  );
}
