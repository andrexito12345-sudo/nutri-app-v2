import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Globe, Clock, User, Trash2 } from 'lucide-react';

const LeadsSection = ({ leads, onDelete }) => {

    const handleChat = (phone) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {leads.length > 0 && (
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        )}
                        Bandeja de Leads
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">Captados hoy: <span className="text-primary-600 font-bold">{leads.length}</span></p>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-auto">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                        <th className="px-6 py-4">Fecha / Hora</th>
                        <th className="px-6 py-4">Fuente</th>
                        <th className="px-6 py-4">Datos del Lead</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {leads.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-16 text-slate-300 italic">
                                <div className="flex flex-col items-center gap-2">
                                    <MessageCircle className="w-8 h-8 opacity-20" />
                                    No hay leads nuevos todavía.
                                </div>
                            </td>
                        </tr>
                    ) : (
                        leads.map((lead, index) => (
                            <motion.tr
                                key={lead.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-slate-50/80 transition-colors group"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-[10px] text-slate-500 font-bold uppercase">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary-400" />
                                        <div>
                                            {new Date(lead.date).toLocaleDateString('es-EC')} <br/>
                                            <span className="text-slate-400">{new Date(lead.date).toLocaleTimeString('es-EC', {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                        ${lead.source.includes('WhatsApp')
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100'}
                                    `}>
                                        {lead.source.includes('WhatsApp') ? <MessageCircle className="w-3 h-3 animate-pulse"/> : <Globe className="w-3 h-3"/>}
                                        {lead.source.includes('WhatsApp') ? 'WhatsApp' : 'Web IMC'}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700 leading-none mb-1">{lead.name}</p>
                                            <p className="text-xs text-slate-400 font-mono tracking-tighter">{lead.phone}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* 👇 AQUÍ ESTÁN LOS BOTONES VISIBLES SIEMPRE */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleChat(lead.phone)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                                        >
                                            Responder
                                        </button>
                                        <button
                                            onClick={() => onDelete(lead.id)}
                                            className="p-2 bg-white border border-red-50 text-red-300 hover:border-red-100 hover:text-red-500 rounded-xl transition-all"
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