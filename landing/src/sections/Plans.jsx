import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Star, Zap, Crown, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Plans() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const [isQuarterly, setIsQuarterly] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState(null); // Estado para saber cuál tarjeta se está mirando

    const plans = [
        {
            id: 1,
            name: "Consulta Inicial",
            price: "19.99",
            period: "/sesión",
            description: "Ideal para diagnóstico y primeros pasos.",
            icon: Star,
            features: [
                "Evaluación nutricional completa",
                "Análisis de composición corporal",
                "Plan de alimentación base",
                "Guía de porciones",
                "Resolución de dudas (15 min)"
            ],
            cta: "Agendar Cita",
            popular: false,
            color: "bg-white",
            btnColor: "bg-primary-50 text-primary-700 hover:bg-primary-100 group-hover:bg-primary-600 group-hover:text-white" // El botón cambia al hacer hover en la card
        },
        {
            id: 2,
            name: "Transformación Total",
            price: isQuarterly ? "30" : "35",
            originalPrice: isQuarterly ? "55" : null,
            period: "/mes",
            description: "El favorito para ver resultados reales y sostenibles.",
            icon: Zap,
            features: [
                "Todo lo de la Consulta Inicial",
                "Menú personalizado semanal",
                "Lista de compras inteligente",
                "Recetario exclusivo (+50 recetas)",
                "Soporte por WhatsApp Lunes a Viernes",
                "Ajustes ilimitados al plan"
            ],
            cta: "Empezar Transformación",
            popular: true,
            color: "bg-gradient-to-b from-primary-600 to-primary-800 text-white",
            btnColor: "bg-white text-primary-700 font-bold shadow-lg hover:bg-neutral-100 group-hover:scale-105"
        },
        {
            id: 3,
            name: "Plan Premium VIP",
            price: isQuarterly ? "40" : "45",
            originalPrice: isQuarterly ? "80" : null,
            period: "/mes",
            description: "Compromiso total a largo plazo. Máxima prioridad.",
            icon: Crown,
            features: [
                "Todo lo del Plan Transformación",
                "Consulta quincenal 1 a 1",
                "Plan de suplementación deportiva",
                "Guía para comer en restaurantes",
                "Acceso a grupo privado de comunidad",
                "Llamadas de emergencia"
            ],
            cta: "Quiero ser VIP",
            popular: false,
            color: "bg-white",
            btnColor: "bg-primary-600 text-white hover:bg-primary-700 group-hover:shadow-primary-500/30"
        }
    ];

    return (
        <section id="planes" className="py-24 bg-neutral-50 relative overflow-hidden">

            {/* --- Background Patterns --- */}
            <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="pricing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pricing-grid)" />
                </svg>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">

                {/* Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
          <span className="inline-block px-4 py-1.5 bg-white text-primary-700 rounded-full font-bold text-xs tracking-wider mb-6 border border-neutral-200 shadow-sm">
            INVERSIÓN EN TU SALUD
          </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
                        Planes Diseñados para
                        <span className="block mt-1 text-primary-600">
              Cada Objetivo
            </span>
                    </h2>
                    <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-8">
                        Elige el nivel de acompañamiento que necesitas. Sin contratos forzosos ni letras pequeñas.
                    </p>

                    {/* --- Interactive Toggle --- */}
                    <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold transition-colors cursor-pointer ${!isQuarterly ? 'text-neutral-900' : 'text-neutral-500'}`} onClick={() => setIsQuarterly(false)}>
              Pago Mensual
            </span>
                        <button
                            onClick={() => setIsQuarterly(!isQuarterly)}
                            className="relative w-16 h-8 rounded-full bg-primary-600 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        >
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                                animate={{ x: isQuarterly ? 32 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${isQuarterly ? 'text-neutral-900' : 'text-neutral-500'}`} onClick={() => setIsQuarterly(true)}>
              Pago Trimestral
              <span className="hidden sm:inline-block px-2 py-0.5 bg-accent-100 text-accent-700 text-[10px] uppercase font-bold tracking-wide rounded-full animate-pulse">
                Ahorra 20%
              </span>
            </span>
                    </div>
                </motion.div>

                {/* Pricing Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const isHovered = hoveredPlan === plan.id;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}

                                // --- INTERACCIÓN DE HOVER AÑADIDA AQUÍ ---
                                whileHover={{
                                    y: -12, // Sube la tarjeta
                                    scale: 1.02, // La hace un poquito más grande
                                    transition: { type: "spring", stiffness: 300, damping: 20 }
                                }}
                                onHoverStart={() => setHoveredPlan(plan.id)}
                                onHoverEnd={() => setHoveredPlan(null)}
                                // -------------------------------------------

                                className={`
                  relative rounded-3xl p-8 md:p-10 transition-all duration-300 flex flex-col group cursor-default
                  ${plan.popular
                                    ? 'bg-gradient-to-b from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-900/40 z-10 ring-4 ring-primary-100/50'
                                    : `bg-white text-neutral-900 shadow-lg border ${isHovered ? 'border-primary-300 shadow-xl shadow-primary-900/10' : 'border-neutral-100'}`
                                }
                `}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-400 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-md uppercase flex items-center gap-1 z-20">
                                        <Sparkles className="w-3 h-3" /> Más Popular
                                    </div>
                                )}

                                {/* Header Card */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${plan.popular ? 'bg-white/20' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>
                                            {plan.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6 min-h-[5rem]">
                                    <div className="flex items-baseline">
                    <span className="text-4xl md:text-5xl font-bold font-display tracking-tight">
                      <AnimatePresence mode="wait">
                        <motion.span
                            key={plan.price}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                          ${plan.price}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                                        <span className={`ml-2 text-sm font-medium ${plan.popular ? 'text-primary-100' : 'text-neutral-500'}`}>
                      {plan.period}
                    </span>
                                    </div>

                                    {/* Original Price strikethrough */}
                                    {plan.originalPrice && (
                                        <div className={`text-sm line-through mt-1 opacity-70 ${plan.popular ? 'text-primary-200' : 'text-neutral-400'}`}>
                                            ${plan.originalPrice}
                                        </div>
                                    )}

                                    <p className={`mt-3 text-sm leading-relaxed ${plan.popular ? 'text-primary-100' : 'text-neutral-500'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className={`h-px w-full mb-8 ${plan.popular ? 'bg-white/20' : 'bg-neutral-100 group-hover:bg-primary-100 transition-colors'}`} />

                                {/* Features List */}
                                <ul className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 transition-colors duration-300 ${plan.popular ? 'bg-accent-400 text-white' : 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'}`}>
                                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm font-medium transition-colors ${plan.popular ? 'text-primary-50' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                        {feature}
                      </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
                                    className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold group-hover:shadow-xl ${plan.btnColor}`}
                                >
                                    {plan.cta}
                                    {/* Flecha que aparece solo en hover */}
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </button>

                            </motion.div>
                        );
                    })}
                </div>

                {/* Guarantee Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center text-neutral-500 text-sm"
                >
                    <p className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary-500" />
                        Todos los planes incluyen garantía de satisfacción de 7 días.
                    </p>
                </motion.div>

            </div>
        </section>
    );
}