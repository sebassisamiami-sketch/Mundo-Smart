# Backend de la firma de Wompi (Cloudflare Worker)

Esto hace que, al pagar con tarjeta, **el monto salga automático y exacto** en Wompi
(el cliente ya no lo escribe). Es gratis con la capa gratuita de Cloudflare.

## Qué necesitas de Wompi
En tu panel de Wompi → **Desarrolladores**, copia:
- Tu **llave pública** (`pub_prod_...` o `pub_test_...`) → esta me la pasas a mí.
- Tu **secreto de integridad** → este **NO me lo pases**. Lo pones tú en Cloudflare (paso 4).

## Pasos para desplegar (desde el navegador, sin instalar nada)

1. Entra a **dash.cloudflare.com** → menú **Workers & Pages** → **Create** → **Create Worker**.
2. Ponle un nombre (ej: `wompi-firma`) y dale **Deploy**. Luego **Edit code**.
3. Borra lo que trae y pega **todo** el contenido del archivo `wompi-signature-worker.js`.
   Dale **Deploy** (arriba a la derecha).
4. Ve a tu Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Type: **Secret**
   - Name: `WOMPI_INTEGRITY_SECRET`
   - Value: tu **secreto de integridad** de Wompi
   - Guarda y vuelve a **Deploy**.
5. Copia la **URL de tu Worker** (algo como `https://wompi-firma.TUCUENTA.workers.dev`).

## Qué me pasas a mí
- La **URL del Worker** (paso 5).
- Tu **llave pública** de Wompi (`pub_...`).

Con eso conecto la página y el pago con tarjeta queda con el **monto exacto automático**.

> Seguridad: el secreto queda solo en Cloudflare (nunca en la página ni en el chat).
> Opcional: en el Worker puedes cambiar `Access-Control-Allow-Origin: '*'` por tu
> dominio (`https://mundo-smart-tienda.web.app`) para que solo tu página lo use.
