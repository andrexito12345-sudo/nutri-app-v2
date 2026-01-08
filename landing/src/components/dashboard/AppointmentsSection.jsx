import React from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Mail,
    Phone,
    Clock,
    Trash2,
    Check,
    X,
} from "lucide-react";

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
                                 handleCreatePatientFromAppointment,
                             }) => {
    // Helper para iniciales
    const getInitials = (name) => {
        if (!name) return "P";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    // Helper para gradientes
    const getAvatarGradient = (name) => {
        const gradients = [
            "from-blue-400 to-indigo-500",
            "from-emerald-400 to-teal-500",
            "from-orange-400 to-rose-500",
            "from-purple-400 to-fuchsia-500",
            "from-cyan-400 to-blue-500",
        ];
        const index = (name?.length || 0) % gradients.length;
        return gradients[index];
    };

    const statusPill = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "pendiente") return "bg-amber-100 text-amber-700 border-amber-200";
        if (s === "realizada") return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (s === "cancelada") return "bg-rose-100 text-rose-700 border-rose-200";
        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    const statusPillText = (status) => {
        const s = String(status || "").toLowerCase();
        if (!s) return "—";
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const goAttend = (appointment) => {
        const finalPatientId = appointment.linked_patient_id || appointment.patient_id;
        if (finalPatientId) {
            navigate(`/consulta/nueva/${appointment.id}/${finalPatientId}`);
        } else {
            handleCreatePatientFromAppointment(appointment);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 flex flex-col h-full">
            {/* --- HEADER & FILTROS --- */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center bg-white z-20 relative">
                {/* Título */}
                <div className="w-full xl:w-auto">
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
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    {/* Buscador */}
                    <div className="relative group w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

            {/* ================= DESKTOP TABLE (SOLO DESKTOP) ================= */}
            <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[650px] custom-scrollbar bg-white">
                <table className="w-full text-left border-collapse">
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
                                    <p className="text-sm text-slate-400">
                                        Intenta cambiar los filtros de búsqueda
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appointment, index) => {
                            const isLead =
                                appointment.reason && appointment.reason.includes("Lead");

                            return (
                                <motion.tr
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`
                                            group transition-all duration-200 hover:bg-slate-50/80
                                            ${isLead ? "bg-amber-50/30 hover:bg-amber-50/60" : ""}
                                        `}
                                >
                                    {/* Paciente */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm bg-gradient-to-br ${getAvatarGradient(
                                                    appointment.patient_name
                                                )}`}
                                            >
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

                                    {/* Motivo */}
                                    <td className="px-6 py-4 max-w-xs">
                                        <div
                                            className={`
                                                    text-xs rounded-lg px-3 py-2 border leading-relaxed
                                                    ${
                                                isLead
                                                    ? "bg-amber-50 border-amber-100 text-amber-800"
                                                    : "bg-white border-slate-100 text-slate-500"
                                            }
                                                `}
                                        >
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
                                                {new Date(
                                                    appointment.appointment_datetime
                                                ).toLocaleTimeString("es-EC", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Estado (armonía con Patients: pill + borde) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusPill(
                                                    appointment.status
                                                )}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                        String(appointment.status || "").toLowerCase() ===
                                                        "pendiente"
                                                            ? "bg-amber-500 animate-pulse"
                                                            : String(appointment.status || "").toLowerCase() ===
                                                            "realizada"
                                                                ? "bg-emerald-500"
                                                                : String(appointment.status || "").toLowerCase() ===
                                                                "cancelada"
                                                                    ? "bg-rose-500"
                                                                    : "bg-slate-400"
                                                    }`}
                                                />
                                                {statusPillText(appointment.status)}
                                            </span>
                                    </td>

                                    {/* Acciones (ICONOS) */}
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

                                            {/* Atender */}
                                            <button
                                                onClick={() => goAttend(appointment)}
                                                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Atender Cita"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>

                                            {/* Cancelar */}
                                            <button
                                                onClick={() => changeStatus(appointment.id, "cancelada")}
                                                disabled={appointment.status === "cancelada"}
                                                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                                                title="Cancelar"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            {/* Eliminar */}
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

            {/* ================= MOBILE CARDS (SOLO MÓVIL) ================= */}
            <div className="block lg:hidden divide-y bg-white">
                {appointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No se encontraron citas</div>
                ) : (
                    appointments.map((appointment, index) => {
                        const isLead =
                            appointment.reason && appointment.reason.includes("Lead");

                        return (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.04 }}
                                className={`p-4 flex flex-col gap-3 ${
                                    isLead ? "bg-amber-50/40" : "bg-white"
                                }`}
                            >
                                {/* Top row: Avatar + Name + Date + Status */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br ${getAvatarGradient(
                                            appointment.patient_name
                                        )}`}
                                    >
                                        {getInitials(appointment.patient_name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">
                                            {appointment.patient_name}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            <span className="truncate">
                                                {formatDate(appointment.appointment_datetime)} ·{" "}
                                                {new Date(
                                                    appointment.appointment_datetime
                                                ).toLocaleTimeString("es-EC", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-extrabold border ${statusPill(
                                            appointment.status
                                        )}`}
                                    >
                                        {statusPillText(appointment.status)}
                                    </span>
                                </div>

                                {/* Contacto */}
                                <div className="text-xs text-slate-500 space-y-1">
                                    {appointment.patient_email && (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Mail className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{appointment.patient_email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        {appointment.patient_phone || "—"}
                                    </div>
                                </div>

                                {/* Motivo (card tipo “bloque” como Patients) */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                    <p className="text-[10px] uppercase font-extrabold text-slate-400">
                                        Motivo
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 mt-1 leading-snug">
                                        {appointment.reason || "Consulta General"}
                                    </p>
                                </div>

                                {/* Acciones (ICONOS en móvil también) */}
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        onClick={() => changeStatus(appointment.id, "pendiente")}
                                        disabled={appointment.status === "pendiente"}
                                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-30 transition-colors"
                                        title="Marcar Pendiente"
                                    >
                                        <Clock className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => goAttend(appointment)}
                                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        title="Atender Cita"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => changeStatus(appointment.id, "cancelada")}
                                        disabled={appointment.status === "cancelada"}
                                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                                        title="Cancelar"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => deleteAppointment(appointment.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AppointmentsSection;
