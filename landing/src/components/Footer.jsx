import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">DV</span>
              </div>
              <div>
                <div className="font-display font-bold text-xl text-white">
                  Daniela Vaca
                </div>
                <div className="text-xs text-neutral-400">Nutrición Profesional</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Transformando vidas a través de la nutrición personalizada y el acompañamiento continuo.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:+593999999999" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                <span>+593 999 999 999</span>
              </a>
              <a href="mailto:contacto@danielavaca.com" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span>contacto@danielavaca.com</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Guayaquil, Ecuador</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Enlaces</h3>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}
                className="block hover:text-primary-400 transition-colors"
              >
                Calculadora IMC
              </button>
              <button
                onClick={() => document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' })}
                className="block hover:text-primary-400 transition-colors"
              >
                Testimonios
              </button>
              <button
                onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
                className="block hover:text-primary-400 transition-colors"
              >
                Agendar Cita
              </button>
            </div>
          </div>

          {/* Social & CTA */}
          <div>
            <h3 className="font-semibold text-white mb-4">Síguenos</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://instagram.com/danielavaca.nutricion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/danielavaca.nutricion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/danielavaca"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <button
              onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-full font-semibold hover:bg-primary-700 transition-colors text-sm"
            >
              Primera Consulta Gratis
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>
            © {currentYear} Daniela Vaca Nutrición. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500" /> para tu salud
          </p>
        </div>
      </div>
    </footer>
  );
}
