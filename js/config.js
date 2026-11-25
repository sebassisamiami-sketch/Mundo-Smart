/*
 * Configuración de la tienda. Edita solo este archivo para ajustar lo básico.
 */
window.CONFIG = {
  storeName: 'Mundo Smart',

  // Tu WhatsApp con indicativo de país y sin "+" ni espacios. Ej: 573001234567
  whatsapp: '57XXXXXXXXXX',

  currency: 'COP',

  // Envío estimado (ajústalo a lo que realmente te cobra Dropi / tu transportadora)
  shippingFlat: 12000,
  freeShippingFrom: 150000,

  /*
   * Cómo se envían los pedidos:
   *  - orderEndpoint vacío  → el pedido se abre en WhatsApp (funciona desde el día 1).
   *  - orderEndpoint con URL → se envía por POST (JSON) a tu backend, y ese backend
   *    crea la orden en Dropi. El token de Dropi NUNCA debe ir en este archivo:
   *    va en el servidor (Firebase Functions, Vercel, etc.).
   */
  orderEndpoint: '',

  // Cuánto tarda normalmente (se muestra al cliente)
  deliveryCO: '2 a 5 días hábiles',
  deliveryIntl: '10 a 25 días (según país y aduana)',
};
