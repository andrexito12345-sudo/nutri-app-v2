import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function Hero() {
  const scrollToBooking = () => {
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
              {/* Social Proof Badge */}
              <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
              >
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-sm font-medium text-neutral-700">
                +500 Vidas Transformadas en 2024
              </span>
              </motion.div>

              {/* Main Headline */}
              <div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight"
                >
                  Transforma Tu Vida
                  <span className="gradient-text block mt-2">
                  Sin Dietas Restrictivas
                </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-neutral-600 mt-6 leading-relaxed"
                >
                  Nutrición personalizada basada en ciencia. Resultados reales,
                  <span className="font-semibold text-primary-700"> sostenibles y sin rebote.</span>
                </motion.p>
              </div>

              {/* Trust Indicators */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 items-center"
              >
                <div className="flex items-center gap-2 text-neutral-600">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium">Nutricionista Certificada</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Sparkles className="w-5 h-5 text-accent-500" />
                  <span className="text-sm font-medium">Método Probado</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
              >
                <button
                    onClick={scrollToBooking}
                    className="btn-primary group flex items-center justify-center gap-2"
                >
                  Agendar Primera Consulta GRATIS
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary"
                >
                  Calcular Mi IMC Gratis
                </button>
              </motion.div>

              {/* Urgency Element */}
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-accent-100 border border-accent-300 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-600 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-accent-900">
                  Solo 3 cupos disponibles esta semana
                </span>
                </div>
              </motion.div>

              {/* Social Proof Numbers */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-200"
              >
                <div>
                  <div className="text-3xl font-bold text-primary-700">95%</div>
                  <div className="text-sm text-neutral-600 mt-1">Tasa de Éxito</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-700">4.9★</div>
                  <div className="text-sm text-neutral-600 mt-1">Valoración</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-700">8+</div>
                  <div className="text-sm text-neutral-600 mt-1">Años Exp.</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Image/Visual */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                {/* Imagen Real */}
                <img
                    src="/images/doctora2%20optimizado.png"
                    alt="Daniela Vaca - Nutricionista Certificada en Guayaquil"
                    className="w-full h-full object-cover object-top"
                    style={{ objectPosition: 'center 8%' }}
                />

                {/* Overlay Sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-primary-800/10" />

                {/* Floating Stats Cards - MÁS PEQUEÑAS Y REPOSICIONADAS */}

                {/* Card Promedio - Arriba Izquierda */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-xl shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 leading-tight">Promedio</div>
                      <div className="text-base font-bold text-primary-700 leading-tight">-8kg</div>
                    </div>
                  </div>
                </div>

                {/* Card Satisfacción - Abajo Derecha */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 leading-tight">Satisfacción</div>
                      <div className="text-base font-bold text-accent-700 leading-tight">98%</div>
                    </div>
                  </div>
                </div>

                {/* Badge Daniela Vaca - Abajo Izquierda */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 leading-tight">Daniela Vaca</p>
                      <p className="text-xs text-neutral-600 leading-tight">Nutricionista Certificada</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <span className="text-sm">Descubre más</span>
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-6 h-10 border-2 border-neutral-300 rounded-full flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-neutral-400 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>
  );
}