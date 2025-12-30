# 🌱 Landing Page - Daniela Vaca Nutrición

Landing page profesional de alto impacto diseñada con psicología del marketing y optimizada para conversión.

## ✨ Características

### Diseño & UX
- ✅ Diseño minimalista y elegante
- ✅ Totalmente responsive (móvil, tablet, desktop)
- ✅ Animaciones sutiles con Framer Motion
- ✅ Tipografía profesional (Playfair Display + Inter)
- ✅ Paleta de colores natural y confiable
- ✅ Carga rápida optimizada

### Psicología del Marketing Aplicada
- ✅ **Escasez:** "Solo 3 cupos disponibles"
- ✅ **Prueba Social:** +500 testimonios reales
- ✅ **Reciprocidad:** Consulta gratis + lead magnets
- ✅ **Autoridad:** Certificaciones y experiencia
- ✅ **Urgencia:** CTAs con tiempo limitado
- ✅ **Compromiso Gradual:** Formulario en 3 pasos

### Secciones Incluidas
1. **Hero** - Primera impresión impactante
2. **Problemas** - Conexión emocional (empatía)
3. **Beneficios** - Transformación posible
4. **Proceso** - 3 pasos simples
5. **Testimonios** - Prueba social fuerte
6. **Calculadora IMC** - Lead magnet interactivo
7. **FAQ** - Elimina objeciones
8. **Agendamiento** - Conversión optimizada

### Funcionalidades
- 🧮 Calculadora de IMC interactiva
- 📅 Sistema de agendamiento en 3 pasos
- 💬 WhatsApp flotante con animaciones
- 📱 Integración WhatsApp Business
- 📊 Google Analytics ready
- 📈 Facebook Pixel ready
- 🔍 SEO optimizado
- 📧 Captura de leads estratégica

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La landing page estará en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
landing/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navegación sticky
│   │   ├── Footer.jsx          # Footer con links
│   │   └── WhatsAppFloat.jsx   # Botón flotante
│   │
│   ├── sections/
│   │   ├── Hero.jsx            # Sección principal
│   │   ├── Problems.jsx        # Problemas/Empatía
│   │   ├── Benefits.jsx        # Beneficios/Solución
│   │   ├── Process.jsx         # Proceso en 3 pasos
│   │   ├── Testimonials.jsx    # Testimonios
│   │   ├── BMICalculator.jsx   # Calculadora IMC
│   │   ├── FAQ.jsx             # Preguntas frecuentes
│   │   └── Booking.jsx         # Formulario de citas
│   │
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globales
│
├── index.html                  # HTML con SEO
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## 🎨 Personalización

### Colores
Editar `tailwind.config.js`:
```javascript
colors: {
  primary: { /* Verde natural */ },
  accent: { /* Amarillo dorado */ },
  neutral: { /* Grises elegantes */ }
}
```

### Contenido
Todos los textos están en español y son fáciles de modificar directamente en cada componente.

### Imágenes
Reemplazar los placeholders en:
- Hero section (foto profesional)
- Testimonios (fotos de pacientes)
- Transformaciones (antes/después)

### WhatsApp
Actualizar número en `src/components/WhatsAppFloat.jsx`:
```javascript
const whatsappNumber = '+593999999999'; // Tu número
```

## 📊 Integración con CRM

### Conectar con Backend
Actualizar `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000', // URL del backend
    changeOrigin: true
  }
}
```

### Endpoints Necesarios
- `POST /api/leads` - Captura de leads (calculadora)
- `POST /api/appointments` - Agendamiento de citas
- `GET /api/availability` - Disponibilidad de horarios

## 🔧 SEO & Analytics

### Google Analytics
1. Obtener tracking ID en Google Analytics
2. Descomentar y actualizar en `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Facebook Pixel
1. Crear pixel en Facebook Business
2. Descomentar y actualizar en `index.html`:
```html
fbq('init', 'TU_PIXEL_ID');
```

### Meta Tags
Actualizar en `index.html`:
- Title
- Description
- Open Graph images
- Canonical URL

## 📱 Redes Sociales

Actualizar links en `src/components/Footer.jsx`:
```javascript
href="https://instagram.com/danielavaca.nutricion"
href="https://facebook.com/danielavaca.nutricion"
```

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta 'dist' a Netlify
```

### Render
1. Conectar repositorio
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

## ✅ Checklist Pre-Launch

### Contenido
- [ ] Actualizar todos los textos
- [ ] Agregar imágenes profesionales
- [ ] Revisar testimonios (reales)
- [ ] Verificar links de redes sociales
- [ ] Actualizar número de WhatsApp

### Técnico
- [ ] Configurar Google Analytics
- [ ] Configurar Facebook Pixel
- [ ] Conectar con backend/CRM
- [ ] Probar formularios
- [ ] Verificar responsive
- [ ] Optimizar imágenes
- [ ] Configurar dominio

### SEO
- [ ] Meta tags completas
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Google Search Console
- [ ] Schema markup

### Legal
- [ ] Política de privacidad
- [ ] Términos y condiciones
- [ ] Aviso de cookies

## 📈 Métricas a Monitorear

### Conversión
- Tasa de conversión general
- Leads generados/día
- Citas agendadas/semana
- Costo por lead
- Tiempo en página

### Engagement
- Bounce rate
- Páginas por sesión
- Clicks en CTAs
- Uso de calculadora IMC
- Clicks en WhatsApp

## 🎯 Optimización Continua

### A/B Tests Sugeridos
1. Headlines del Hero
2. Color de CTAs
3. Longitud del formulario
4. Ubicación de testimonios
5. Oferta principal

### Mejoras Futuras
- [ ] Chat en vivo
- [ ] Blog integrado
- [ ] Portal de pacientes
- [ ] Sistema de pagos online
- [ ] Calendario interactivo
- [ ] Video testimonials
- [ ] Quiz de diagnóstico

## 🆘 Soporte

Para dudas o problemas:
1. Revisar la documentación
2. Verificar la consola del navegador
3. Comprobar configuración de variables
4. Revisar logs del servidor

## 📚 Recursos Adicionales

- [Guía de Marketing Digital](./ESTRATEGIA-MARKETING-DIGITAL.md)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Desarrollado con ❤️ para transformar vidas a través de la nutrición**
