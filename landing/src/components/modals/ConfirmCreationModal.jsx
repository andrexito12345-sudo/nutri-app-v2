import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, FileText } from 'lucide-react';

const ConfirmCreationModal = ({ isOpen, onClose, onConfirm, patientName }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                >
                    {/* Barra superior azul */}
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />

                    <div className="p-6 md:p-8 text-center">
                        {/* Ícono animado */}
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                <UserPlus className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Textos */}
                        <h3 className="text-2xl font-black text-slate-800 mb-2">
                            ¿Paciente Nuevo?
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            El paciente <span className="text-blue-600 font-bold">{patientName}</span> no tiene expediente clínico registrado.<br/><br/>
                            ¿Deseas crearle una ficha nueva automáticamente con los datos de la cita?
                        </p>

                        {/* Botones */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Sí, Crear Ficha
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmCreationModal;