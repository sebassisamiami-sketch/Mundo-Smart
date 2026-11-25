# Mundo Smart

Tienda de **tecnología, gadgets y artículos inteligentes** (dropshipping, pensada para enlazar con Dropi). Página de una sola vista, con fondo 3D animado (cubo de cristal que reacciona al scroll), catálogo filtrable, carrito y checkout con pago contra entrega.

No necesita servidor ni compilar para funcionar: son archivos estáticos. El carrito y el checkout trabajan desde el primer momento, enviando el pedido por **WhatsApp**.

## Estructura

```
index.html          Página
css/styles.css      Estilos
js/config.js        ← AQUÍ configuras tu tienda (WhatsApp, envío, etc.)
js/products.js      ← AQUÍ pones tus productos de Dropi
js/app.js           Lógica (catálogo, carrito, checkout)
js/cube.bundle.js   Escena 3D (ya compilada)
src/cube.js         Código fuente de la escena 3D (Three.js)
```

## Qué tienes que configurar

1. **Tu WhatsApp** → en `js/config.js`, campo `whatsapp` (con indicativo, sin `+` ni espacios, ej: `573001234567`).
2. **Tus productos** → en `js/products.js`. Reemplaza los de ejemplo por los reales de Dropi: nombre, precio, fotos (`img`) y, cuando conectes el backend, el `dropiId` de cada producto.
3. **Envío** → `shippingFlat` y `freeShippingFrom` en `js/config.js`.

## Cómo se envían los pedidos

- **Modo sencillo (por defecto):** el pedido se arma como mensaje y se abre en WhatsApp. Funciona sin backend.
- **Modo automático con Dropi:** pon una URL en `orderEndpoint` (`js/config.js`). La página enviará el pedido por POST (JSON) a tu backend, y ese backend crea la orden en Dropi.
  **Importante:** el token de Dropi NUNCA va en estos archivos (son públicos). Va en el servidor (Firebase Functions, Vercel, etc.).

## Ver la página en local

Al ser archivos estáticos, basta con abrir `index.html`. Para probar como en producción:

```bash
npx serve .
```

## Editar la animación 3D

Si cambias `src/cube.js`, recompila el bundle:

```bash
npm install
npm run build
```
