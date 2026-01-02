import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

// 👇 1. Recibimos 'title' y 'message' aquí
const ConfirmDeleteModal = ({
                                isOpen,
                                onClose,
                                onConfirm,
                                title = "¿Eliminar Cita?",
                                message = "Estás a punto de eliminar este registro permanentemente."
                            }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="h-2 w-full bg-gradient-to-r from-red-500 to-rose-600" />

                    <div className="p-6 md:p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse-slow">
                                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* 👇 2. CAMBIO CLAVE: Usamos {title} en lugar de texto fijo */}
                        <h3 className="text-2xl font-black text-slate-800 mb-2">
                            {title}
                        </h3>

                        {/* 👇 3. CAMBIO CLAVE: Usamos {message} aquí */}
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            {message} <br/>

                            {/* Un pequeño truco: Si el mensaje es texto simple, agregamos la advertencia roja.
                                Si ya viene con HTML (como en pacientes), no la duplicamos. */}
                            {typeof message === 'string' && (
                                <span className="text-red-500 font-bold">Esta acción no se puede deshacer.</span>
                            )}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmDeleteModal;