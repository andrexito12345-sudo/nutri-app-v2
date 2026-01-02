import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react'; // Agregamos Clock

function QuickActions({
                          onOpenPatientForm,
                          onOpenIMC,
                          onOpenStats,
                          onOpenDiet,
                          onOpenHerramientasAvanzadas
                      }) {

    // --- LÓGICA DEL RELOJ EN VIVO ---
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Actualizar cada segundo para que sea preciso
        const timer = setInterval(() => setCurrentDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatear Fecha: "Viernes, 2 de enero de 2026"
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = currentDate.toLocaleDateString('es-EC', dateOptions);
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Formatear Hora: "10:42 AM"
    const timeStr = currentDate.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });

    const actions = [
        {
            id: 'patient',
            label: 'Nuevo Paciente',
            description: 'Registrar información',
            svgIcon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
            ),
            gradient: 'from-blue-400 via-blue-500 to-blue-600',
            onClick: onOpenPatientForm,
        },
        {
            id: 'imc',
            label: 'Calculadora IMC',
            description: 'Peso y talla',
            svgIcon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 7H16M8 11H16M8 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ),
            gradient: 'from-purple-400 via-purple-500 to-purple-600',
            onClick: onOpenIMC,
        },
        {
            id: 'stats',
            label: 'Estadísticas',
            description: 'Métricas y reportes',
            svgIcon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M3 3v18h18M7 16l4-4 3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ),
            gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
            onClick: onOpenStats,
        },
        {
            id: 'diet',
            label: 'Generar Dieta',
            description: 'Planes automáticos',
            svgIcon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M16 2v5h3l-3 7M9 6v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9" cy="3" r="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
            ),
            gradient: 'from-orange-400 via-orange-500 to-orange-600',
            onClick: onOpenDiet,
        },
        {
            id: 'advanced',
            label: 'Herramientas PRO',
            description: 'TMB • FFMI • % Grasa',
            svgIcon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ),
            gradient: 'from-rose-400 via-rose-500 to-rose-600',
            onClick: onOpenHerramientasAvanzadas,
        }
    ];

    return (
        <div className="mb-8">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">

                {/* Título */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <svg className="w-6 h-6 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Gestión Administrativa
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-1 ml-8">
                        Accesos directos a herramientas frecuentes
                    </p>
                </div>

                {/* Widget de Fecha y Hora (Glass Style) */}
                <div className="hidden md:flex items-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-600 text-sm font-medium overflow-hidden">
                    {/* Fecha */}
                    <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100 bg-slate-50/50">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formattedDate}</span>
                    </div>
                    {/* Hora */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 font-bold min-w-[100px] justify-center">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{timeStr}</span>
                    </div>
                </div>
            </div>

            {/* --- BOTONES ORIGINALES (Estilo Negro) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {actions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={action.onClick}
                        className="group relative"
                    >
                        {/* Gradient Border */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[2px]`}>
                            <div className="h-full w-full bg-black rounded-2xl" />
                        </div>

                        {/* Content */}
                        <div className="relative bg-black rounded-2xl p-4 border-2 border-neutral-800 group-hover:border-transparent transition-colors duration-300">
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white flex-shrink-0`}>
                                    {action.svgIcon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className="font-bold text-white text-sm mb-0.5">
                                        {action.label}
                                    </h3>
                                    <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors truncate">
                                        {action.description}
                                    </p>
                                </div>

                                {/* Dot Indicator */}
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${action.gradient} opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export default QuickActions;