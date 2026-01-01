import React from 'react';
import { Clock, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

function UpcomingTimeline({ appointments, formatDate }) {
    // Filtrar próximas citas pendientes (máximo 5)
    const upcomingAppointments = appointments
        .filter(apt => apt.status === 'pendiente')
        .filter(apt => new Date(apt.appointment_datetime) >= new Date())
        .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
        .slice(0, 2);

    if (upcomingAppointments.length === 0) {
        return (
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-black text-neutral-900 mb-4">Próximas Citas</h3>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500">No hay citas próximas</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-neutral-900">Próximas Citas</h3>
                    <p className="text-xs text-neutral-500">{upcomingAppointments.length} pendientes</p>
                </div>
            </div>

            <div className="space-y-3">
                {upcomingAppointments.map((appointment, index) => (
                    <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                    >
                        {/* Timeline Dot */}
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary-500 group-hover:scale-125 transition-transform" />
                            {index < upcomingAppointments.length - 1 && (
                                <div className="w-0.5 h-12 bg-neutral-200 mt-2" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-neutral-600" />
                                <p className="font-bold text-neutral-900">{appointment.patient_name}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-600">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(appointment.appointment_datetime)}
                                </span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">
                                    {appointment.reason?.split(' - ')[0] || 'Consulta'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default UpcomingTimeline;