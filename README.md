# Sistema de Recordatorios — Dashboard

Dashboard Next.js para visualizar los vencimientos del sistema de recordatorios.

## Requisitos previos

Antes de empezar necesitas tener Node.js instalado.

### Verificar si tienes Node.js
Abre una terminal y escribe:
```
node -v
```
Si ves un número (ej: v20.11.0) ya lo tienes.
Si no, descárgalo de: https://nodejs.org (descarga la versión LTS)

---

## PASO 1 — Desplegar el Web App de Apps Script

Esto genera la URL que el dashboard usará para leer los datos.

1. Abre tu Google Sheet → **Extensiones → Apps Script**
2. Clic en **Implementar → Nueva implementación**
3. Clic en el ícono ⚙️ → selecciona **Aplicación web**
4. Configura:
   - Descripción: `Dashboard Recordatorios`
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Clic en **Implementar**
6. Autoriza los permisos
7. **Copia la URL** que aparece (termina en `/exec`)

---

## PASO 2 — Configurar el proyecto

1. Abre la carpeta `recordatorios-dashboard` en VS Code
2. Abre el archivo `.env.local`
3. Reemplaza `TU_URL_AQUI` con la URL copiada en el paso anterior:
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXX/exec
```

---

## PASO 3 — Instalar dependencias y correr en local

Abre la terminal en VS Code (Ctrl+ñ en Windows / Ctrl+` en Mac) y ejecuta:

```bash
npm install
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## PASO 4 — Desplegar en Vercel

### Opción A — Desde la web (más fácil)
1. Crea cuenta en https://vercel.com (gratis)
2. Sube la carpeta a GitHub (crea un repo nuevo)
3. En Vercel: **New Project → importa el repo**
4. En **Environment Variables** agrega:
   - Key: `NEXT_PUBLIC_APPS_SCRIPT_URL`
   - Value: tu URL de Apps Script
5. Clic en **Deploy**

### Opción B — Desde la terminal
```bash
npm install -g vercel
vercel
```
Sigue las instrucciones y cuando pida variables de entorno agrega `NEXT_PUBLIC_APPS_SCRIPT_URL`.

---

## Estructura del proyecto

```
recordatorios-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css      ← estilos globales
│   │   ├── layout.tsx       ← layout raíz
│   │   ├── page.tsx         ← dashboard principal
│   │   └── page.module.css  ← estilos del dashboard
│   └── types.ts             ← tipos TypeScript
├── .env.local               ← tu URL de Apps Script (NO subir a GitHub)
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Funcionalidades del dashboard

- **Vista urgentes** — tarjetas con los registros más próximos a vencer
- **Contadores** — vencidos, críticos, próximos, al día (clic para filtrar)
- **Tabla completa** — todos los registros con colores según estado
- **Buscador** — filtra por nombre, programa o correo
- **Filtro de estado** — muestra solo el estado seleccionado
- **Umbrales configurables** — edita los días de aviso desde el dashboard
- **Última ejecución** — muestra cuándo corrió el script por última vez

## Estados y colores

| Estado  | Color   | Significado                    |
|---------|---------|--------------------------------|
| Vencido | 🔴 Rojo | Ya pasó la fecha de vencimiento|
| Crítico | 🟠 Rojo | ≤ 5 días para vencer           |
| Próximo | 🟡 Amarillo | ≤ 7 días para vencer        |
| Al día  | 🟢 Verde | Más de 7 días                  |

---

## Notas importantes

- El `.env.local` **NO se sube a GitHub** (ya está en .gitignore)
- En Vercel configuras la variable de entorno desde el panel
- Los datos son de solo lectura — para agregar registros usa el Formulario del Google Sheet
- Si cambias umbrales desde el dashboard, también actualízalos en la hoja Config del Sheet
