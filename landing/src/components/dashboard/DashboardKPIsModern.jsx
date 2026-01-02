import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function DashboardKPIsModern({ metrics, visitStats }) {
    // Validación segura de datos para evitar el "undefined" de la imagen
    const safeMetrics = {
        totalAppointments: metrics?.totalAppointments || 0,
        pending: metrics?.pending || 0,
        completed: metrics?.completed || 0,
        completionRate: metrics?.completionRate || '0%',
        cancelled: metrics?.cancelled || 0,
        cancellationRate: metrics?.cancellationRate || '0%',
    };

    const kpis = [
        {
            id: 'total',
            label: 'Total Citas', // Texto más corto para móvil
            value: safeMetrics.totalAppointments,
            subtitle: 'Histórico',
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
            value: safeMetrics.pending,
            subtitle: 'Requiere atención',
            icon: Clock,
            theme: 'amber',
            gradient: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50',
            textLight: 'text-amber-600',
            hasAlert: safeMetrics.pending > 0,
            alertPulse: true
        },
        {
            id: 'completed',
            label: 'Completadas',
            value: safeMetrics.completed,
            subtitle: `Tasa: ${safeMetrics.completionRate}`,
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
            value: safeMetrics.cancelled,
            subtitle: `Tasa: ${safeMetrics.cancellationRate}`,
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
            {/* Título de sección opcional para dar contexto (se puede quitar si prefieres) */}
            {/* <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1">Resumen General</h3> */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group"
                    >
                        <div className={`
                            relative h-full flex flex-col justify-between
                            bg-white rounded-2xl border border-neutral-100 shadow-sm
                            hover:shadow-lg hover:border-neutral-200 transition-all duration-300
                            overflow-hidden
                            ${kpi.hasAlert ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                        `}>

                            {/* Alert Pulse Background (Solo si hay alerta) */}
                            {kpi.alertPulse && (
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="p-4 md:p-5">
                                {/* Header: Icon & Label */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-xl ${kpi.bgLight} ${kpi.textLight}`}>
                                        <kpi.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                                    </div>

                                    {/* En móvil ocultamos el label largo arriba y lo ponemos abajo o viceversa */}
                                    {/* <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider md:hidden">
                                        {kpi.id === 'pending' ? 'URGENTE' : 'INFO'}
                                    </span> */}
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

                            {/* Footer / Subtitle Strip */}
                            <div className={`
                                px-4 py-2 bg-gradient-to-r ${kpi.bgLight} border-t border-neutral-100
                                flex items-center justify-between
                            `}>
                                <span className={`text-[10px] md:text-xs font-medium ${kpi.textLight} truncate w-full`}>
                                    {kpi.subtitle}
                                </span>
                            </div>

                            {/* Bottom Accent Line (Brand Identity) */}
                            <div className={`h-1 w-full bg-gradient-to-r ${kpi.gradient}`} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default DashboardKPIsModern;