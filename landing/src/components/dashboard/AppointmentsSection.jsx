import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, ChevronRight, Mail, Phone, Clock, Trash2 } from 'lucide-react';

const AppointmentsSection = ({
                                 appointments,
                                 metrics,
                                 filters,
                                 setSearch,
                                 setStatusFilter,
                                 setDateFilter,
                                 formatDate,
                                 changeStatus,
                                 deleteAppointment,
                                 navigate,
                                 handleCreatePatientFromAppointment
                             }) => {

    // Helper para iniciales
    const getInitials = (name) => {
        if (!name) return "P";
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };

    // Helper para gradientes
    const getAvatarGradient = (name) => {
        const gradients = [
            'from-blue-400 to-indigo-500',
            'from-emerald-400 to-teal-500',
            'from-orange-400 to-rose-500',
            'from-purple-400 to-fuchsia-500',
            'from-cyan-400 to-blue-500'
        ];
        const index = (name?.length || 0) % gradients.length;
        return gradients[index];
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 flex flex-col h-full">

            {/* --- HEADER & FILTROS --- */}
            <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white z-20 relative">

                {/* Título */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        Gestión de Citas
                        {metrics.pending > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-sm shadow-rose-200">
                                {metrics.pending} NUEVAS
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Mostrando las últimas actualizaciones
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    {/* Buscador */}
                    <div className="relative group w-full md:w-64">

                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Estado */}
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filters.status}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-slate-600 font-medium"
                        >
                            <option value="todas">Todos los estados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="realizada">Completadas</option>
                            <option value="cancelada">Canceladas</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>

                    {/* Fecha */}
                    <div className="relative w-full md:w-48">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filters.date}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-slate-600 font-medium"
                        >
                            <option value="todos">Todas las fechas</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta semana</option>
                            <option value="mes">Este mes</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* --- TABLA CON SCROLL (Altura limitada) --- */}
            {/* max-h-[650px] es aprox 10 filas. overflow-y-auto activa el scroll */}
            <div className="overflow-x-auto overflow-y-auto max-h-[650px] custom-scrollbar bg-white">
                <table className="w-full text-left border-collapse">

                    {/* Header Sticky (Se queda fijo al hacer scroll) */}
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Paciente</th>
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Contacto</th>
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Motivo / Lead</th>
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Fecha</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-50">Estado</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-50">Acciones</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No se encontraron citas</p>
                                    <p className="text-sm text-slate-400">Intenta cambiar los filtros de búsqueda</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appointment, index) => {
                            const isLead = appointment.reason && appointment.reason.includes("Lead");

                            return (
                                <motion.tr
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`
                                            group transition-all duration-200 hover:bg-slate-50/80
                                            ${isLead ? 'bg-amber-50/30 hover:bg-amber-50/60' : ''}
                                        `}
                                >
                                    {/* Paciente */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm bg-gradient-to-br ${getAvatarGradient(appointment.patient_name)}`}>
                                                {getInitials(appointment.patient_name)}
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                                    {appointment.patient_name}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Contacto */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {appointment.patient_email && (
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <Mail className="w-3 h-3 mr-1.5 opacity-70" />
                                                    {appointment.patient_email}
                                                </div>
                                            )}
                                            <div className="flex items-center text-xs text-slate-500">
                                                <Phone className="w-3 h-3 mr-1.5 opacity-70" />
                                                {appointment.patient_phone || "—"}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Motivo (Lead Highlight) */}
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className={`
                                                text-xs rounded-lg px-3 py-2 border leading-relaxed
                                                ${isLead
                                            ? 'bg-amber-50 border-amber-100 text-amber-800'
                                            : 'bg-white border-slate-100 text-slate-500'}
                                            `}>
                                                <span className="line-clamp-2" title={appointment.reason}>
                                                    {appointment.reason || "Consulta General"}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Fecha */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {formatDate(appointment.appointment_datetime)}
                                                </span>
                                            <span className="text-xs text-slate-400 flex items-center mt-0.5">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                {new Date(appointment.appointment_datetime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`
                                                inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                                                ${appointment.status === 'pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                                                ${appointment.status === 'realizada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                                                ${appointment.status === 'cancelada' ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 
                                                    ${appointment.status === 'pendiente' ? 'bg-amber-500 animate-pulse' : ''}
                                                    ${appointment.status === 'realizada' ? 'bg-emerald-500' : ''}
                                                    ${appointment.status === 'cancelada' ? 'bg-rose-500' : ''}
                                                `}/>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Pendiente */}
                                            <button
                                                onClick={() => changeStatus(appointment.id, "pendiente")}
                                                disabled={appointment.status === "pendiente"}
                                                className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-30 transition-colors"
                                                title="Marcar Pendiente"
                                            >
                                                <Clock className="w-4 h-4" />
                                            </button>

                                            {/* Completar */}
                                            <button
                                                onClick={() => {
                                                    const finalPatientId = appointment.linked_patient_id || appointment.patient_id;
                                                    if (finalPatientId) {
                                                        navigate(`/consulta/nueva/${appointment.id}/${finalPatientId}`);
                                                    } else {
                                                        handleCreatePatientFromAppointment(appointment);
                                                    }
                                                }}
                                                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Atender Cita"
                                            >
                                                <span className="font-bold">✓</span>
                                            </button>

                                            {/* Cancelar */}
                                            <button
                                                onClick={() => changeStatus(appointment.id, "cancelada")}
                                                disabled={appointment.status === "cancelada"}
                                                className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                                                title="Cancelar"
                                            >
                                                <span className="font-bold">✕</span>
                                            </button>

                                            {/* Eliminar (Basura) */}
                                            <button
                                                onClick={() => deleteAppointment(appointment.id)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsSection;