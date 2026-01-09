import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Activity, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardKPIsModern({ metrics, visitStats, appointmentStats, appointments = [], onOpenMenu }) {
    const [filter, setFilter] = useState('hoy');

    // ✅ CALCULAR STATS DE HOY directamente desde appointments
    const statsToday = useMemo(() => {
        if (!Array.isArray(appointments) || appointments.length === 0) {
            return { total: 0, pending: 0, done: 0, cancelled: 0 };
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const todayAppointments = appointments.filter(app => {
            const appDate = new Date(app.appointment_datetime);
            return appDate >= todayStart && appDate <= todayEnd;
        });

        return {
            total: todayAppointments.length,
            pending: todayAppointments.filter(a => a.status === 'pendiente').length,
            done: todayAppointments.filter(a => a.status === 'completada').length,
            cancelled: todayAppointments.filter(a => a.status === 'cancelada').length
        };
    }, [appointments]);

    const statsTotal = {
        total: metrics?.total || 0,
        pending: metrics?.pending || 0,
        completed: metrics?.done || 0,
        cancelled: metrics?.cancelled || 0,
    };

    const currentStats = filter === 'hoy' ? {
        total: statsToday.total,
        pending: statsToday.pending,
        completed: statsToday.done,
        cancelled: statsToday.cancelled,
        subtitle: 'Agenda del día'
    } : {
        total: statsTotal.total,
        pending: statsTotal.pending,
        completed: statsTotal.completed,
        cancelled: statsTotal.cancelled,
        subtitle: 'Histórico total'
    };

    const kpis = [
        {
            id: 'total',
            label: filter === 'hoy' ? 'Citas Hoy' : 'Total Citas',
            value: currentStats.total,
            icon: Calendar,
            theme: 'blue',
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
            premiumBg: 'from-slate-50 via-rose-50/50 to-pink-50/20',
            iconGradient: 'from-rose-600 to-pink-600',
            glowColor: 'bg-rose-500/20',
            hasAlert: false
        }
    ];

    return (
        <div className="mb-6 mt-2">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-3">

                {/* Título y Botón Móvil */}
                <div className="flex justify-between items-center w-full md:w-auto">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            {filter === 'hoy' ? 'Panel Diario' : 'Visión Global'}
                        </h2>
                    </div>

                    <button
                        onClick={onOpenMenu}
                        className="lg:hidden p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Switcher Compacto */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl backdrop-blur-md border border-slate-200/50 self-start md:self-auto">
                    {['hoy', 'total'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`
                                px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 capitalize
                                ${filter === item
                                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700'}
                            `}
                        >
                            {item === 'total' ? 'Histórico' : item}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- GRID COMPACTO --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <AnimatePresence mode="popLayout">
                    {kpis.map((kpi, index) => (
                        <motion.div
                            key={kpi.id + filter}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="relative group z-0"
                        >
                            <div className={`
                                relative h-full overflow-hidden
                                rounded-2xl
                                bg-gradient-to-br ${kpi.premiumBg}
                                border border-white/60
                                shadow-sm shadow-slate-200/50
                                transition-all duration-300
                                group-hover:shadow-md group-hover:-translate-y-0.5
                                ${kpi.hasAlert ? 'ring-2 ring-amber-500/50 ring-offset-1' : ''}
                            `}>
                                {/* Glows sutiles */}
                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${kpi.glowColor} blur-[40px] opacity-30 pointer-events-none`} />
                                <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full ${kpi.glowColor} blur-[40px] opacity-20 pointer-events-none`} />

                                {/* Contenido Compacto */}
                                <div className="relative z-10 p-4 flex flex-col h-full justify-between backdrop-blur-[1px]">

                                    {/* Header Icon */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`
                                            p-2 rounded-xl bg-gradient-to-br ${kpi.iconGradient}
                                            shadow-md shadow-${kpi.theme}-500/20
                                        `}>
                                            <kpi.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                        </div>
                                        {kpi.alertPulse && (
                                            <span className="relative flex h-2.5 w-2.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Value & Label */}
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
                                            {kpi.value}
                                        </h3>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide opacity-90">
                                            {kpi.label}
                                        </p>
                                    </div>

                                    {/* Footer line */}
                                    <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center text-[10px] font-medium text-slate-400">
                                        <TrendingUp className="w-3 h-3 mr-1 opacity-70" />
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