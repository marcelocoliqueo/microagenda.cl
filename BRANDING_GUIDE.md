# MicroAgenda - Guía de Identidad Visual

## 🎨 Visión General

**MicroAgenda** es un micro-SaaS chileno que ayuda a profesionales independientes a automatizar sus reservas sin perder la cercanía humana.

### Personalidad de Marca
- **Cálida**: Cercana y amigable
- **Profesional**: Confiable y seria
- **Local**: Orgullosamente chilena
- **Simple**: Sin complicaciones innecesarias

### Tono de Comunicación
- Humano, no corporativo
- Directo pero amable
- Usa "tú" (tutear)
- Lenguaje local chileno cuando sea apropiado
- Evita tecnicismos excesivos

---

## 🪶 Logo e Isotipo

### Isotipo Principal
**Pluma Abstracta**
- Dos curvas suaves que forman una hoja/ala/pluma
- Simboliza ligereza, agilidad y profesionalismo
- Bicolor: Azul petróleo + Verde oliva

### Uso del Emoji
En contextos digitales informales:
- 🪶 Pluma (Unicode: U+1FAB6)
- Se puede usar junto al nombre: "MicroAgenda 🪶"

### Archivos
```
/public/logo.svg     - Logo completo con texto
/public/icon.png     - Isotipo solo (512x512px)
/public/favicon.ico  - Favicon para navegadores
```

---

## 🎨 Paleta de Colores

### Colores Primarios

| Color | Nombre | Hex | RGB | Uso |
|-------|--------|-----|-----|-----|
| ![#2563EB](https://via.placeholder.com/15/2563EB/2563EB.png) | Azul Petróleo | `#2563EB` | `rgb(37, 99, 235)` | Primario, CTAs, links |
| ![#84CC16](https://via.placeholder.com/15/84CC16/84CC16.png) | Verde Oliva | `#84CC16` | `rgb(132, 204, 22)` | Secundario, éxito, confirmaciones |
| ![#FCD34D](https://via.placeholder.com/15/FCD34D/FCD34D.png) | Terracota Suave | `#FCD34D` | `rgb(252, 211, 77)` | Acentos, destacados |

### Colores de Texto y Fondo

| Color | Nombre | Hex | Uso |
|-------|--------|-----|-----|
| ![#1E293B](https://via.placeholder.com/15/1E293B/1E293B.png) | Gris Oscuro | `#1E293B` | Texto principal |
| ![#64748B](https://via.placeholder.com/15/64748B/64748B.png) | Gris Medio | `#64748B` | Texto secundario |
| ![#94A3B8](https://via.placeholder.com/15/94A3B8/94A3B8.png) | Gris Claro | `#94A3B8` | Texto deshabilitado |
| ![#F8FAFC](https://via.placeholder.com/15/F8FAFC/F8FAFC.png) | Fondo Claro | `#F8FAFC` | Fondo general |
| ![#FFFFFF](https://via.placeholder.com/15/FFFFFF/FFFFFF.png) | Blanco | `#FFFFFF` | Cards, modales |

### Colores de Estado

| Estado | Color | Hex | Uso |
|--------|-------|-----|-----|
| Éxito | Verde | `#10B981` | Confirmaciones, completado |
| Advertencia | Amarillo | `#F59E0B` | Pendiente, alertas |
| Error | Rojo | `#EF4444` | Errores, cancelaciones |
| Info | Azul | `#3B82F6` | Información general |

### Ejemplos de Uso

```css
/* Botón Primario */
background: #2563EB;
color: #FFFFFF;

/* Botón Secundario */
background: #84CC16;
color: #1E293B;

/* Texto sobre fondo */
background: #F8FAFC;
color: #1E293B;

/* Enlace */
color: #2563EB;
hover: #1D4ED8;

/* Badge de éxito */
background: #D1FAE5;
color: #065F46;
```

---

## 🔤 Tipografía

### Fuentes Principales

**Poppins** (Principal)
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)
- Uso: Títulos, headings, botones, UI general
- Google Fonts: `https://fonts.google.com/specimen/Poppins`

**Nunito Sans** (Alternativa)
- Weights: Regular (400), Semibold (600), Bold (700)
- Uso: Cuerpo de texto, párrafos largos
- Google Fonts: `https://fonts.google.com/specimen/Nunito+Sans`

### Jerarquía Tipográfica

```
H1 (Hero)      → Poppins Bold, 48px / 3rem
H2 (Section)   → Poppins Semibold, 36px / 2.25rem
H3 (Card)      → Poppins Semibold, 24px / 1.5rem
H4 (Subtitle)  → Poppins Medium, 20px / 1.25rem
Body Large     → Poppins Regular, 18px / 1.125rem
Body Regular   → Poppins Regular, 16px / 1rem
Body Small     → Poppins Regular, 14px / 0.875rem
Caption        → Poppins Regular, 12px / 0.75rem
```

### Implementación en CSS

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap');

body {
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1E293B;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
```

---

## 📐 Espaciado y Grid

### Sistema de Espaciado (8px base)

```
4px   → 0.25rem
8px   → 0.5rem
12px  → 0.75rem
16px  → 1rem
24px  → 1.5rem
32px  → 2rem
48px  → 3rem
64px  → 4rem
96px  → 6rem
```

### Border Radius

```
sm   → 0.5rem  (8px)
md   → 0.75rem (12px)
lg   → 1rem    (16px)
xl   → 1.5rem  (24px)
```

### Sombras

```css
/* Card */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

/* Card Hover */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Modal */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 🖼️ Componentes UI

### Botones

```tsx
// Primario
<button className="bg-primary text-white px-6 py-3 rounded-xl font-medium">
  Agendar Cita
</button>

// Secundario
<button className="bg-secondary text-text px-6 py-3 rounded-xl font-medium">
  Ver Más
</button>

// Outline
<button className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-medium">
  Cancelar
</button>
```

### Cards

```tsx
<div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
  <h3 className="font-semibold text-lg mb-2">Título</h3>
  <p className="text-muted">Contenido</p>
</div>
```

### Badges

```tsx
// Éxito
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
  Confirmada
</span>

// Pendiente
<span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm">
  Pendiente
</span>

// Cancelada
<span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm">
  Cancelada
</span>
```

---

## ✍️ Tono de Voz y Mensajes

### Ejemplos de Copywriting

#### ✅ Bien (MicroAgenda)
- "Tu agenda simple, cercana y profesional"
- "Automatiza tus reservas sin perder cercanía"
- "Hola, bienvenido de vuelta"
- "¡Listo! Tu cita está confirmada"
- "Ayudamos a profesionales como tú a crecer"

#### ❌ Evitar
- "Solución empresarial de clase mundial"
- "Plataforma revolucionaria de gestión"
- "Optimización de procesos empresariales"
- "Suite integral de herramientas"

### Frases Comunes

| Contexto | Frase MicroAgenda |
|----------|-------------------|
| Bienvenida | "Hola, bienvenido a MicroAgenda 🪶" |
| Éxito | "¡Listo! Todo guardado correctamente" |
| Error | "Ups, algo salió mal. Inténtalo de nuevo" |
| Confirmación | "¿Estás seguro? Esta acción no se puede deshacer" |
| Loading | "Cargando tus datos..." |
| Vacío | "Aún no tienes citas programadas" |
| CTA | "Comienza gratis ahora" |

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Prioridades
1. **Mobile**: 320px - 640px (principal)
2. **Tablet**: 640px - 1024px
3. **Desktop**: 1024px+

---

## 🌐 SEO y Metadata

### Titles
```
Página              | Title
--------------------|----------------------------------
Home                | MicroAgenda - Tu agenda simple, cercana y profesional
Dashboard           | Panel | MicroAgenda
Registro            | Crear cuenta | MicroAgenda
Login               | Iniciar sesión | MicroAgenda
Agenda Pública      | Reservar con {Nombre} | MicroAgenda
```

### Descriptions
```
Home:
"Automatiza tus reservas sin perder cercanía. Sistema de agendamiento profesional para manicuristas, barberos, terapeutas y más. Prueba gratis."

Dashboard:
"Gestiona tus citas, servicios y clientes desde un solo lugar. Simple, rápido y profesional."
```

### OG Tags
```html
<meta property="og:title" content="MicroAgenda - Tu agenda simple y profesional" />
<meta property="og:description" content="Automatiza tus reservas sin perder cercanía" />
<meta property="og:image" content="https://microagenda.cl/og.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 📋 Checklist de Branding

### Diseño
- [ ] Usa la paleta de colores oficial
- [ ] Tipografía Poppins/Nunito Sans
- [ ] Border radius mínimo 0.75rem (12px)
- [ ] Espaciado múltiplo de 8px
- [ ] Mobile-first responsive

### Copywriting
- [ ] Tono cálido y cercano
- [ ] Tutear (usar "tú")
- [ ] Evitar tecnicismos
- [ ] Mensajes cortos y claros
- [ ] Incluir emoji 🪶 cuando sea apropiado

### UI Components
- [ ] Botones con rounded-xl
- [ ] Cards con sombra sutil
- [ ] Badges con colores semánticos
- [ ] Loading states con shimmer
- [ ] Feedback visual claro

---

## 🚫 Errores Comunes a Evitar

1. ❌ Usar colores fuera de la paleta oficial
2. ❌ Mezclar fuentes no definidas (ej: Arial, Times)
3. ❌ Border radius menores a 8px
4. ❌ Tono corporativo o muy formal
5. ❌ Mensajes genéricos sin personalidad
6. ❌ Olvidar el estado mobile
7. ❌ No usar el isotipo 🪶 en contextos apropiados

---

## 📞 Contacto

Para dudas sobre branding:
- Email: soporte@microagenda.cl
- Documentación: [README.md](README.md)

---

**Versión**: 1.0
**Última actualización**: Enero 2025
**Mantenido por**: Equipo MicroAgenda

> "Tu agenda simple, cercana y profesional" 🪶
