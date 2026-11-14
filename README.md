# Ohana · Obrador

App web instalable (PWA) para almacén, pedidos y escandallo de costes. Es estática: no necesita servidor, base de datos ni Render.

## Subir a Netlify (lo más rápido)
1. Entra en https://app.netlify.com/drop e inicia sesión.
2. Arrastra la carpeta `ohana-app` (la que contiene `index.html`).
3. Netlify te da un enlace tipo `https://tu-nombre.netlify.app`. Puedes cambiar el nombre en Site settings.

## Subir a GitHub Pages
1. Crea un repositorio nuevo en GitHub (público).
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)` → Save.
4. En un minuto estará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Instalar en el móvil
- iPhone: abre el enlace en Safari → Compartir → Añadir a pantalla de inicio.
- Android: abre el enlace en Chrome → menú ⋮ → Instalar app / Añadir a pantalla de inicio.

Instálala primero y empieza a meter datos desde el icono: en iPhone, la app instalada y Safari guardan los datos por separado.

## Lector de tickets
Funciona con Tesseract.js (gratuito, se ejecuta en el propio móvil; la foto no se envía a ningún servidor). La primera vez descarga el lector (unos MB) y necesita internet. Revisa siempre la lista antes de añadirla al almacén.

## Actualizar
Cambia `index.html` y vuelve a subir. Si cambias archivos de la app, sube también el número de `CACHE` en `sw.js` (por ejemplo `ohana-v2`).
