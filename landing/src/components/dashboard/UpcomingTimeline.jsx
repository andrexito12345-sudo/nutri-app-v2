import React from 'react';
import { Calendar, Clock, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

function UpcomingTimeline({ appointments }) {
    // 1. Filtrar y ordenar citas
    const upcomingAppointments = appointments
        ? appointments
            .filter(apt => apt.status === 'pendiente')
            .filter(apt => new Date(apt.appointment_datetime) >= new Date())
            .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
            .slice(0, 2) // 👈 AQUÍ ESTÁ EL CAMBIO: Solo mostramos las 2 más próximas
        : [];

    // Helper para iniciales
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    // Helper para gradientes
    const getGradient = (name) => {
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-purple-500 to-violet-600'
        ];
        const index = (name?.length || 0) % gradients.length;
        return gradients[index];
    };

    // Helper para formatear fecha bonita
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return {
            day: date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }), // Ej: 04 Ene
            time: date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) // Ej: 10:00 AM
        };
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col relative overflow-hidden">

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Próximas Citas
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                        Agenda inmediata
                    </p>
                </div>

                <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                    {upcomingAppointments.length} Pendientes
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 relative z-10 overflow-hidden">
                {upcomingAppointments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-4 opacity-60">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                            <Calendar className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Todo despejado hoy</p>
                    </div>
                ) : (
                    <div className="relative pl-2 h-full flex flex-col gap-4">
                        {/* Línea Vertical */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100 rounded-full" />

                        {upcomingAppointments.map((appointment, index) => {
                            const { day, time } = formatDateTime(appointment.appointment_datetime);
                            const isLead = appointment.reason && appointment.reason.includes("Lead");

                            return (
                                <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="relative flex items-start gap-4 group"
                                >
                                    {/* Avatar / Punto de Tiempo */}
                                    <div className="relative z-10 flex-shrink-0 mt-1">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ring-4 ring-white
                                            bg-gradient-to-br ${getGradient(appointment.patient_name)}
                                            group-hover:scale-110 transition-transform duration-300
                                        `}>
                                            {getInitials(appointment.patient_name)}
                                        </div>
                                    </div>

                                    {/* Tarjeta de Info */}
                                    <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 truncate">
                                                    {appointment.patient_name}
                                                </h4>

                                                {/* FECHA Y HORA COMPLETAS */}
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-100">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {day}
                                                    </span>
                                                    <span className="flex items-center bg-white px-2 py-0.5 rounded border border-slate-200">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DATOS DEL LEAD / MOTIVO */}
                                        <div className={`
                                            text-xs rounded-lg p-2 leading-relaxed border
                                            ${isLead
                                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                                            : 'bg-white text-slate-500 border-slate-100'}
                                        `}>
                                            {isLead && <span className="block font-bold mb-1 text-amber-600">🚀 Datos del Lead:</span>}
                                            <span className="line-clamp-2"> {/* Evita que se haga muy largo si hay mucho texto */}
                                                {appointment.reason || "Consulta General"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Decoración */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}

export default UpcomingTimeline;