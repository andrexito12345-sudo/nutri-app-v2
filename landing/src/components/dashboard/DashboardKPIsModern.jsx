import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

function DashboardKPIsModern({ metrics, visitStats }) {
    const kpis = [
        {
            id: 'total',
            label: 'Total de Citas',
            value: metrics.totalAppointments,
            subtitle: 'Registro completo',
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            iconColor: 'text-blue-600',
            hasAlert: false
        },
        {
            id: 'pending',
            label: 'Pendientes',
            value: metrics.pending,
            subtitle: '¡Atención requerida!',
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-50 to-orange-50',
            iconColor: 'text-amber-600',
            hasAlert: metrics.pending > 0,
            alertPulse: true
        },
        {
            id: 'completed',
            label: 'Completadas',
            value: metrics.completed,
            subtitle: `Tasa: ${metrics.completionRate}`,
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-green-600',
            bgGradient: 'from-emerald-50 to-green-50',
            iconColor: 'text-emerald-600',
            hasAlert: false
        },
        {
            id: 'cancelled',
            label: 'Canceladas',
            value: metrics.cancelled,
            subtitle: `Tasa: ${metrics.cancellationRate}`,
            icon: XCircle,
            gradient: 'from-rose-500 to-red-600',
            bgGradient: 'from-rose-50 to-red-50',
            iconColor: 'text-rose-600',
            hasAlert: false
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {kpis.map((kpi, index) => (
                <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative group mobile-kpi"
                >
                    {/* Card */}
                    <div className={`
                    relative overflow-hidden bg-white rounded-xl md:rounded-2xl border-2 border-neutral-200 
                    p-4 md:p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                    ${kpi.hasAlert ? 'border-amber-400 shadow-lg shadow-amber-100' : ''}
                `}>
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-40`} />

                        {/* Alert Pulse Effect */}
                        {kpi.alertPulse && (
                            <div className="absolute inset-0 animate-pulse bg-amber-100 opacity-20" />
                        )}

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Header with Icon */}
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">
                                        {kpi.label}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl md:text-4xl font-black text-neutral-900">
                                            {kpi.value}
                                        </h3>
                                        {kpi.hasAlert && (
                                            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                                            !
                                        </span>
                                        )}
                                    </div>
                                </div>

                                {/* Icon with Gradient */}
                                <div className={`
                                p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${kpi.gradient} 
                                shadow-lg group-hover:scale-110 transition-transform duration-300
                            `}>
                                    <kpi.icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="text-xs text-neutral-500 font-medium">
                                {kpi.subtitle}
                            </p>
                        </div>

                        {/* Bottom Accent Bar */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default DashboardKPIsModern;