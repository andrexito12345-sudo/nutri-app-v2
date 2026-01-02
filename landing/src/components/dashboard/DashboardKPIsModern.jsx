import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardKPIsModern({ metrics, visitStats, appointmentStats }) {
    const [filter, setFilter] = useState('hoy');

    // --- DATOS SEGUROS ---
    const statsTotal = {
        total: metrics?.totalAppointments || 0,
        pending: metrics?.pending || 0,
        completed: metrics?.completed || 0,
        cancelled: metrics?.cancelled || 0,
    };

    const statsToday = appointmentStats?.today || { total: 0, pending: 0, done: 0, cancelled: 0 };

    const currentStats = filter === 'hoy' ? {
        total: statsToday.total || 0,
        pending: statsToday.pending || 0,
        completed: statsToday.done || 0,
        cancelled: statsToday.cancelled || 0,
        subtitle: 'Agenda del día'
    } : {
        total: statsTotal.total,
        pending: statsTotal.pending,
        completed: statsTotal.completed,
        cancelled: statsTotal.cancelled,
        subtitle: 'Histórico total'
    };

    // --- CONFIGURACIÓN PREMIUM DE KPIS ---
    const kpis = [
        {
            id: 'total',
            label: filter === 'hoy' ? 'Citas Hoy' : 'Total Citas',
            value: currentStats.total,
            icon: Calendar,
            theme: 'blue',
            // Nuevos gradientes premium
            premiumBg: 'from-slate-50 via-blue-50/50 to-indigo-50/20',
            iconGradient: 'from-blue-600 to-indigo-500',
            glowColor: 'bg-blue-500/20',
            hasAlert: false
        },
        {
            id: 'pending',
            label: 'Pendientes',
            value: currentStats.pending,
            icon: Clock,
            theme: 'amber',
            // Gradiente cálido sofisticado
            premiumBg: 'from-slate-50 via-amber-50/50 to-orange-50/20',
            iconGradient: 'from-amber-500 to-orange-600',
            glowColor: 'bg-amber-500/20',
            hasAlert: currentStats.pending > 0,
            alertPulse: currentStats.pending > 0
        },
        {
            id: 'completed',
            label: 'Completadas',
            value: currentStats.completed,
            icon: CheckCircle,
            theme: 'emerald',
            // Gradiente fresco y lujoso
            premiumBg: 'from-slate-50 via-emerald-50/50 to-teal-50/20',
            iconGradient: 'from-emerald-500 to-teal-600',
            glowColor: 'bg-emerald-500/20',
            hasAlert: false
        },
        {
            id: 'cancelled',
            label: 'Canceladas',
            value: currentStats.cancelled,
            icon: XCircle,
            theme: 'rose',
            // Gradiente serio pero elegante
            premiumBg: 'from-slate-50 via-rose-50/50 to-pink-50/20',
            iconGradient: 'from-rose-600 to-pink-600',
            glowColor: 'bg-rose-500/20',
            hasAlert: false
        }
    ];

    return (
        <div className="mb-8">
            {/* --- HEADER PREMIUM Y FILTROS --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        {filter === 'hoy' ? 'Panel Diario' : 'Visión Global'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {filter === 'hoy' ? 'Monitoreo de actividad en tiempo real' : 'Rendimiento acumulado de tu consultorio'}
                    </p>
                </div>

                {/* Switcher Sofisticado */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl backdrop-blur-md border border-slate-200/50 self-start md:self-auto">
                    {['hoy', 'total'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`
                                px-5 py-2 text-sm font-bold rounded-xl transition-all duration-500 ease-out capitalize
                                ${filter === item
                                ? 'bg-white text-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/5 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                            `}
                        >
                            {item === 'total' ? 'Histórico' : item}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- GRID PREMIUM "AURORA GLASS" --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <AnimatePresence mode="wait">
                    {kpis.map((kpi, index) => (
                        <motion.div
                            key={kpi.id + filter}
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.4, delay: index * 0.08, type: "spring", stiffness: 100 }}
                            className="relative group z-0"
                        >
                            <div className={`
                                relative h-full overflow-hidden
                                rounded-[2rem] // Bordes muy redondeados
                                bg-gradient-to-br ${kpi.premiumBg} // Gradiente de fondo sutil
                                border border-white/60 // Borde translúcido tipo cristal
                                shadow-xl shadow-slate-200/40 // Sombra suave y difusa
                                transition-all duration-500
                                group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:-translate-y-1
                                ${kpi.hasAlert ? 'ring-2 ring-amber-500/50 ring-offset-2' : ''}
                            `}>

                                {/* --- EFECTO AURORA (GLOW INTERNO) --- */}
                                {/* Luz superior derecha */}
                                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${kpi.glowColor} blur-[60px] opacity-40 md:opacity-30 mix-blend-multiply pointer-events-none z-0`} />
                                {/* Luz inferior izquierda (más sutil) */}
                                <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full ${kpi.glowColor} blur-[60px] opacity-30 md:opacity-20 mix-blend-multiply pointer-events-none z-0`} />


                                {/* --- CONTENIDO DE LA TARJETA --- */}
                                <div className="relative z-10 p-5 md:p-6 flex flex-col h-full justify-between backdrop-blur-[2px]">

                                    {/* Header: Icono Joya y Alerta */}
                                    <div className="flex justify-between items-start mb-4">
                                        {/* Icono "Joya" Flotante */}
                                        <div className={`
                                            p-3 rounded-2xl bg-gradient-to-br ${kpi.iconGradient}
                                            shadow-lg shadow-${kpi.theme}-500/20
                                            group-hover:shadow-${kpi.theme}-500/40 group-hover:scale-110 transition-all duration-500
                                        `}>
                                            <kpi.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                        </div>

                                        {/* Indicador de Alerta Pulsante Sofisticado */}
                                        {kpi.alertPulse && (
                                            <div className="relative flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-amber-500 to-orange-500 border-2 border-white"></span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Valor Principal */}
                                    <div>
                                        <h3 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
                                            {kpi.value}
                                        </h3>
                                        <p className="text-sm md:text-base font-bold text-slate-600 mt-2 uppercase tracking-wider opacity-80">
                                            {kpi.label}
                                        </p>
                                    </div>

                                    {/* Subtítulo integrado */}
                                    <div className="mt-4 pt-3 border-t border-slate-200/30 flex items-center text-xs font-medium text-slate-500">
                                        <TrendingUp className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                        {currentStats.subtitle}
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default DashboardKPIsModern;