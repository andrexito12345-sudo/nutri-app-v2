import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Globe, Clock, User, Trash2 } from 'lucide-react';

const LeadsSection = ({ leads, onDelete }) => {

    // Función para abrir WhatsApp Web directo al dar click
    const handleChat = (phone) => {
        if (!phone) return;
        // Limpiamos el número de caracteres raros
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Bandeja de Leads
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">Posibles pacientes captados por el Bot y Web</p>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Fuente</th>
                        <th className="px-6 py-4">Interesado</th>
                        <th className="px-6 py-4 text-center">Acción</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {leads.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-10 text-slate-400">
                                No hay leads nuevos todavía.
                            </td>
                        </tr>
                    ) : (
                        leads.map((lead, index) => (
                            <motion.tr
                                key={lead.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-slate-50/80 transition-colors"
                            >
                                {/* Fecha */}
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-slate-300" />
                                        {new Date(lead.date).toLocaleDateString('es-EC')} <br/>
                                        {new Date(lead.date).toLocaleTimeString('es-EC', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>

                                {/* Fuente (Bot o Web) */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`
                                            inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border
                                            ${lead.source.includes('WhatsApp')
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'}
                                        `}>
                                            {lead.source.includes('WhatsApp') ? <MessageCircle className="w-3 h-3"/> : <Globe className="w-3 h-3"/>}
                                            {lead.source.includes('WhatsApp') ? 'Bot WP' : 'Web'}
                                        </span>
                                </td>

                                {/* Datos del Cliente */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{lead.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{lead.phone}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* 👇 ACCIONES (AQUÍ ESTÁ EL CAMBIO) */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Botón Responder */}
                                        <button
                                            onClick={() => handleChat(lead.phone)}
                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-green-200"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                            Responder
                                        </button>

                                        {/* 👇 Botón Eliminar (Icono SVG) */}
                                        <button
                                            onClick={() => onDelete(lead.id)}
                                            className="p-1.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors shadow-sm"
                                            title="Eliminar Lead"
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

export default LeadsSection;