import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    // Mostrar el bubble después de 5 segundos
    const timer = setTimeout(() => {
      setShowBubble(true);
      // Ocultar automáticamente después de 10 segundos
      setTimeout(() => setShowBubble(false), 10000);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // ⚠️ IMPORTANTE: El número debe ir SIN el símbolo '+' y SIN espacios.
  // Solo código de país (593) y el número.
  const whatsappNumber = '593990765627';

  // Este mensaje activa el "Trigger" de tu NutriBot porque dice "Hola" y "Agendar"
  const defaultMessage = '¡Hola! Quiero agendar una consulta de nutrición 🌱';

  const handleWhatsAppClick = () => {
    // Usamos wa.me que es el estándar actual
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  return (
      <>
        {/* Bubble Message (Globo de texto) */}
        <AnimatePresence>
          {showBubble && !isOpen && (
              <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  className="fixed bottom-28 right-6 md:right-8 z-50 max-w-xs"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-4 relative border border-gray-100">
                  <button
                      onClick={() => setShowBubble(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center text-white hover:bg-neutral-800 transition-colors shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold text-lg">
                      DV
                    </div>
                    {/* Texto */}
                    <div>
                      <p className="font-bold text-neutral-800 mb-0.5 text-sm">Dra. Daniela Vaca</p>
                      <p className="text-xs text-neutral-600 leading-snug">
                        ¿Tienes dudas? ¡Escríbeme y mi asistente virtual te ayuda al instante! 🤖
                      </p>
                    </div>
                  </div>
                </div>
                {/* Triangulito del globo */}
                <div className="w-4 h-4 bg-white transform rotate-45 absolute -bottom-2 right-10 border-r border-b border-gray-100" />
              </motion.div>
          )}
        </AnimatePresence>

        {/* Botón Principal Flotante */}
        <motion.button
            onClick={handleWhatsAppClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center z-50 group hover:bg-[#20BA5A] transition-all duration-300"
            aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-8 h-8 text-white" fill="white" />

          {/* Animación de Onda (Pulse) */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />

          {/* Tooltip al pasar el mouse */}
          <div className="absolute right-full mr-4 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl transform translate-x-2 group-hover:translate-x-0 transition-transform">
            ¡Chatea con nosotros!
            <div className="w-0 h-0 border-l-[6px] border-t-[6px] border-b-[6px] border-l-neutral-900 border-t-transparent border-b-transparent absolute right-[-6px] top-1/2 -translate-y-1/2" />
          </div>
        </motion.button>
      </>
  );
}