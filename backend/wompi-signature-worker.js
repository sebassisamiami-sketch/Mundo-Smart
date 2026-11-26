/*
 * Cloudflare Worker — Firma de integridad para Wompi (Mundo Smart)
 *
 * Qué hace: recibe { reference, amountInCents, currency } desde tu página y
 * devuelve { signature }. Con esa firma, Wompi acepta el monto EXACTO que viene
 * del carrito (el cliente ya no tiene que escribirlo).
 *
 * TU SECRETO NUNCA VA EN ESTE CÓDIGO. Se pone como variable secreta en Cloudflare
 * con el nombre:  WOMPI_INTEGRITY_SECRET
 *
 * Cómo desplegarlo está en backend/README.md
 */
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') {
      return json({ error: 'Usa POST' }, 405, cors);
    }
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'JSON inválido' }, 400, cors);
    }
    const reference = String(body.reference || '');
    const amountInCents = String(body.amountInCents || '');
    const currency = String(body.currency || 'COP');
    const secret = env.WOMPI_INTEGRITY_SECRET;

    if (!reference || !amountInCents || !secret) {
      return json({ error: 'Faltan datos o el secreto no está configurado' }, 400, cors);
    }

    // Wompi: SHA256( reference + amountInCents + currency + secretoDeIntegridad )
    const data = reference + amountInCents + currency + secret;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    const signature = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');

    return json({ signature }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors),
  });
}
