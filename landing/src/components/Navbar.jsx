import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-4'
        : 'bg-transparent py-6'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">DV</span>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-neutral-900">
                Daniela Vaca
              </div>
              <div className="text-xs text-neutral-600">Nutrición Profesional</div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('testimonios')}
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              Calculadora IMC
            </button>
            <button
              onClick={() => scrollToSection('agendar')}
              className="btn-primary flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Agendar Consulta
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-neutral-200 pt-4 space-y-3">
            <button
              onClick={() => scrollToSection('testimonios')}
              className="block w-full text-left py-2 text-neutral-700 hover:text-primary-600 font-medium"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="block w-full text-left py-2 text-neutral-700 hover:text-primary-600 font-medium"
            >
              Calculadora IMC
            </button>
            <button
              onClick={() => scrollToSection('agendar')}
              className="btn-primary w-full justify-center flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Agendar Consulta
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
