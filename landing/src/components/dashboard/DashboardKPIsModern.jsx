import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardKPIsModern({ metrics, visitStats, appointmentStats }) {
    // Estado para el filtro: 'hoy' | 'total'
    const [filter, setFilter] = useState('hoy');

    // Extraemos datos seguros (Valores por defecto si algo viene null)
    // DATOS TOTALES (HISTÓRICO)
    const statsTotal = {
        total: metrics?.totalAppointments || 0,
        pending: metrics?.pending || 0,
        completed: metrics?.completed || 0,
        cancelled: metrics?.cancelled || 0,
    };

    // DATOS DE HOY (Simulados o reales si los pasas en appointmentStats)
    // Asumo que appointmentStats.today viene del hook useDashboardLogic
    const statsToday = appointmentStats?.today || {
        total: 0,
        pending: 0,
        done: 0,
        cancelled: 0
    };

    // Seleccionamos qué datos mostrar según el filtro
    const currentStats = filter === 'hoy' ? {
        total: statsToday.total || 0,
        pending: statsToday.pending || 0,
        completed: statsToday.done || 0,
        cancelled: statsToday.cancelled || 0,
        labelContext: 'Agenda de Hoy'
    } : {
        total: statsTotal.total,
        pending: statsTotal.pending,
        completed: statsTotal.completed,
        cancelled: statsTotal.cancelled,
        labelContext: 'Histórico Total'
    };

    const kpis = [
        {
            id: 'total',
            label: filter === 'hoy' ? 'Citas Hoy' : 'Total Citas',
            value: currentStats.total,
            subtitle: currentStats.labelContext,
            icon: Calendar,
            theme: 'blue',
            gradient: 'from-blue-500 to-indigo-600',
            bgLight: 'bg-blue-50',
            textLight: 'text-blue-600',
            hasAlert: false
        },
        {
            id: 'pending',
            label: 'Pendientes',
            value: currentStats.pending,
            subtitle: filter === 'hoy' ? 'Por atender hoy' : 'Total acumulado',
            icon: Clock,
            theme: 'amber',
            gradient: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50',
            textLight: 'text-amber-600',
            hasAlert: currentStats.pending > 0, // Alerta si hay pendientes
            alertPulse: currentStats.pending > 0
        },
        {
            id: 'completed',
            label: 'Completadas',
            value: currentStats.completed,
            subtitle: 'Finalizadas',
            icon: CheckCircle,
            theme: 'emerald',
            gradient: 'from-emerald-400 to-teal-500',
            bgLight: 'bg-emerald-50',
            textLight: 'text-emerald-600',
            hasAlert: false
        },
        {
            id: 'cancelled',
            label: 'Canceladas',
            value: currentStats.cancelled,
            subtitle: 'No asistieron',
            icon: XCircle,
            theme: 'rose',
            gradient: 'from-rose-500 to-red-600',
            bgLight: 'bg-rose-50',
            textLight: 'text-rose-600',
            hasAlert: false
        }
    ];

    return (
        <div className="mb-6">
            {/* --- SECCIÓN DE FILTROS (LA MAGIA DE LA OPCIÓN B) --- */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-neutral-800">
                        {filter === 'hoy' ? 'Resumen del Día' : 'Métricas Globales'}
                    </h2>
                    <p className="text-xs text-neutral-500">
                        {filter === 'hoy' ? 'Lo que tienes programado para hoy' : 'Rendimiento histórico de tu consultorio'}
                    </p>
                </div>

                {/* Switcher de Filtros */}
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('hoy')}
                        className={`
                            px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300
                            ${filter === 'hoy'
                            ? 'bg-white text-neutral-800 shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-600'}
                        `}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setFilter('total')}
                        className={`
                            px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300
                            ${filter === 'total'
                            ? 'bg-white text-neutral-800 shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-600'}
                        `}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {/* --- GRID DE TARJETAS --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.id + filter} // El key cambia para forzar la animación al cambiar filtro
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group"
                    >
                        <div className={`
                            relative h-full flex flex-col justify-between
                            bg-white rounded-2xl border border-neutral-100 shadow-sm
                            transition-all duration-300
                            ${kpi.hasAlert ? 'ring-2 ring-amber-400 ring-offset-1 shadow-amber-100' : 'hover:shadow-lg'}
                        `}>

                            {/* Alerta Pulsante */}
                            {kpi.alertPulse && (
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="p-4 md:p-5">
                                {/* Header: Icon */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-xl ${kpi.bgLight} ${kpi.textLight}`}>
                                        <kpi.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                                    </div>
                                </div>

                                {/* Main Value */}
                                <div>
                                    <h3 className="text-2xl md:text-4xl font-black text-neutral-800 tracking-tight">
                                        {kpi.value}
                                    </h3>
                                    <p className="text-xs md:text-sm font-semibold text-neutral-500 mt-1 truncate">
                                        {kpi.label}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Subtitle */}
                            <div className={`
                                px-4 py-2 bg-gradient-to-r ${kpi.bgLight} border-t border-neutral-100
                                flex items-center justify-between
                            `}>
                                <span className={`text-[10px] md:text-xs font-medium ${kpi.textLight} truncate w-full`}>
                                    {kpi.subtitle}
                                </span>
                            </div>

                            {/* Accent Line */}
                            <div className={`h-1 w-full bg-gradient-to-r ${kpi.gradient}`} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default DashboardKPIsModern;