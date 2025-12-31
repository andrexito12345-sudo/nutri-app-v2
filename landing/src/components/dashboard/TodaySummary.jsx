import React from 'react';
import { Calendar, Clock, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function TodaySummary({ appointments, visitStats }) {
    const today = new Date().toLocaleDateString('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_datetime);
        const now = new Date();
        return aptDate.toDateString() === now.toDateString();
    });

    const todayPending = todayAppointments.filter(apt => apt.status === 'pendiente').length;
    const todayCompleted = todayAppointments.filter(apt => apt.status === 'realizada').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6 relative overflow-hidden today-summary-mobile"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white">Resumen de Hoy</h2>
                        <p className="text-xs md:text-sm text-white/80 font-medium capitalize">{today}</p>
                    </div>
                </div>

                {/* Stats Grid - 2 columnas en móvil */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mobile-stats-grid">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
                            <p className="text-xs text-white/70 font-semibold uppercase">Total Hoy</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{todayAppointments.length}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300" />
                            <p className="text-xs text-white/70 font-semibold uppercase">Pendientes</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-amber-300">{todayPending}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-300" />
                            <p className="text-xs text-white/70 font-semibold uppercase">Completadas</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-emerald-300">{todayCompleted}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
                            <p className="text-xs text-white/70 font-semibold uppercase">Visitas Totales</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{visitStats.total}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default TodaySummary;