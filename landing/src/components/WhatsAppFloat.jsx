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

  const whatsappNumber = '+593999999999'; // Cambiar por el número real
  const defaultMessage = '¡Hola! Quiero agendar una consulta de nutrición 🌱';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Bubble Message */}
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-28 right-6 md:right-8 z-50 max-w-xs"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 relative">
              <button
                onClick={() => setShowBubble(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center text-white hover:bg-neutral-800"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">DV</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 mb-1">Daniela Vaca</p>
                  <p className="text-sm text-neutral-600">
                    ¿Tienes dudas? ¡Escríbeme por WhatsApp! 🌱
                  </p>
                </div>
              </div>
            </div>
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white absolute -bottom-2 right-8" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.button
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center z-50 group hover:bg-[#20BA5A] transition-colors"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white" fill="white" />
        
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ¡Chatea con nosotros!
          <div className="w-0 h-0 border-l-4 border-t-4 border-b-4 border-l-neutral-900 border-t-transparent border-b-transparent absolute right-0 top-1/2 -translate-y-1/2 translate-x-full" />
        </div>
      </motion.button>
    </>
  );
}
