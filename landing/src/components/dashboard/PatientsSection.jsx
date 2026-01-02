import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Eye, Printer, Edit, Trash2, Mail, Phone, Calendar, Activity } from 'lucide-react';

const PatientsSection = ({
                             patients,
                             search,
                             setSearch,
                             openPatientForm,
                             viewPatientRecord,
                             printLatestConsultation,
                             editPatient,
                             deletePatient
                         }) => {

    // Helper: Iniciales
    const getInitials = (name) => {
        if (!name) return "P";
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };

    // Helper: Gradientes (Misma paleta que citas para consistencia)
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

            {/* --- HEADER & ACCIONES --- */}
            <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white z-20 relative">

                {/* Título */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        Gestión de Pacientes
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-slate-200">
                            {patients.length} TOTAL
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Historial clínico y seguimiento
                    </p>
                </div>

                {/* Buscador y Botón Nuevo */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    {/* Buscador Glass */}
                    <div className="relative group w-full md:w-72">

                        <input
                            type="text"
                            placeholder="Buscar por nombre, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Botón Nuevo Paciente */}
                    <button
                        onClick={openPatientForm}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Nuevo Paciente</span>
                    </button>
                </div>
            </div>

            {/* --- TABLA CON SCROLL (Altura limitada) --- */}
            <div className="overflow-x-auto overflow-y-auto max-h-[650px] custom-scrollbar bg-white">
                <table className="w-full text-left border-collapse">

                    {/* Header Sticky */}
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr className="text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Paciente</th>
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Contacto</th>
                        <th className="px-6 py-4 whitespace-nowrap bg-slate-50">Última Consulta</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-50">Historial</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-50">Estado Físico</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center bg-slate-50">Acciones</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                    {patients.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <UserPlus className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No se encontraron pacientes</p>
                                    <p className="text-sm text-slate-400">Prueba buscar con otro nombre o crea uno nuevo</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        patients.map((patient, index) => (
                            <motion.tr
                                key={patient.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="group transition-all duration-200 hover:bg-slate-50/80"
                            >
                                {/* Paciente */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm bg-gradient-to-br ${getAvatarGradient(patient.full_name)}`}>
                                            {getInitials(patient.full_name)}
                                        </div>
                                        <div>
                                                <span className="font-bold text-slate-700 block group-hover:text-blue-600 transition-colors">
                                                    {patient.full_name}
                                                </span>
                                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                    ID: {patient.id}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Contacto */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        {patient.email && (
                                            <div className="flex items-center text-xs text-slate-500">
                                                <Mail className="w-3 h-3 mr-1.5 opacity-70" />
                                                {patient.email}
                                            </div>
                                        )}
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Phone className="w-3 h-3 mr-1.5 opacity-70" />
                                            {patient.phone || "—"}
                                        </div>
                                    </div>
                                </td>

                                {/* Última Consulta */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-300" />
                                        {patient.last_consultation
                                            ? new Date(patient.last_consultation).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : <span className="text-slate-400 italic">Sin registros</span>
                                        }
                                    </div>
                                </td>

                                {/* Contador Consultas */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`
                                            inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                                            ${patient.consultation_count > 0 ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400'}
                                        `}>
                                            {patient.consultation_count || 0}
                                        </span>
                                </td>

                                {/* Datos Físicos (Peso/IMC) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex justify-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Peso</span>
                                            <span className="text-sm font-bold text-slate-700">
                                                    {patient.current_weight ? `${patient.current_weight} kg` : "—"}
                                                </span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">IMC</span>
                                            <span className={`
                                                    text-sm font-bold px-1.5 rounded
                                                    ${patient.bmi > 25 ? 'text-amber-600 bg-amber-50' : 'text-slate-700'}
                                                `}>
                                                    {patient.bmi || "—"}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Ver Expediente */}
                                        <button
                                            onClick={() => viewPatientRecord(patient)}
                                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            title="Ver Expediente"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Imprimir Última */}
                                        <button
                                            onClick={() => printLatestConsultation(patient)}
                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Imprimir Última Consulta"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>

                                        {/* Editar */}
                                        <button
                                            onClick={() => editPatient(patient)}
                                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                            title="Editar Datos"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        {/* Eliminar (Ahora usa tu modal nuevo) */}
                                        <button
                                            onClick={() => deletePatient(patient.id, patient.full_name)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Eliminar Paciente"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsSection;