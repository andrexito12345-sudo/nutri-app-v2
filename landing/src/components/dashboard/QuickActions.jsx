import React from 'react';
import { Plus, Calculator, BarChart3, Utensils, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function QuickActions({
                          onOpenPatientForm,
                          onOpenIMC,
                          onOpenStats,
                          onOpenDiet,
                          onOpenHerramientasAvanzadas
                      }) {
    const actions = [
        {
            id: 'patient',
            label: 'Nuevo Paciente',
            description: 'Registrar información',
            icon: Plus,
            iconBg: 'bg-blue-500',
            onClick: onOpenPatientForm,
        },
        {
            id: 'imc',
            label: 'Calculadora IMC',
            description: 'Peso y talla',
            icon: Calculator,
            iconBg: 'bg-purple-500',
            onClick: onOpenIMC,
        },
        {
            id: 'stats',
            label: 'Estadísticas',
            description: 'Métricas y reportes',
            icon: BarChart3,
            iconBg: 'bg-emerald-500',
            onClick: onOpenStats,
        },
        {
            id: 'diet',
            label: 'Generar Dieta',
            description: 'Planes automáticos',
            icon: Utensils,
            iconBg: 'bg-orange-500',
            onClick: onOpenDiet,
        },
        {
            id: 'advanced',
            label: 'Herramientas PRO',
            description: 'TMB • FFMI • % Grasa',
            icon: Zap,
            iconBg: 'bg-teal-500',
            onClick: onOpenHerramientasAvanzadas,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {actions.map((action, index) => (
                <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="group flex items-center gap-3 bg-white border-2 border-neutral-200 rounded-xl p-3 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                    {/* Icon */}
                    <div className={`
                        ${action.iconBg} 
                        p-2.5 rounded-lg 
                        flex-shrink-0
                    `}>
                        <action.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-sm text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                            {action.label}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                            {action.description}
                        </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.button>
            ))}
        </div>
    );
}

export default QuickActions;