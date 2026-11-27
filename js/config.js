/*
 * Configuración de la tienda. Edita solo este archivo para ajustar lo básico.
 */
window.CONFIG = {
  storeName: 'Mundo Smart',

  // Tu WhatsApp con indicativo de país y sin "+" ni espacios. Ej: 573001234567
  whatsapp: '573112350585',

  currency: 'COP',

  // Garantía que se muestra en cada producto. AJÚSTALA a lo que realmente ofreces.
  warranty: 'Garantía de 30 días por defectos de fábrica. Si tu producto llega dañado o con fallas, lo cambiamos sin costo. No cubre mal uso.',

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

  /*
   * MÉTODOS DE PAGO
   * El cliente elige uno en el checkout. "Contra entrega" funciona siempre.
   * Para los pagos con tarjeta debes pegar TU llave PÚBLICA del proveedor
   * (la sacas de tu panel de comercio). La llave pública es segura ponerla aquí.
   * NUNCA pongas aquí llaves privadas/secretas: esas van en un backend.
   */
  payments: {
    contraentrega: true, // pago al recibir (Colombia). Siempre disponible.

    // ePayco: FUNCIONA solo con tu llave pública (no necesita backend obligatorio).
    // Saca tu PUBLIC_KEY en: https://dashboard.epayco.co → Configuración → Llaves API.
    epayco: {
      enabled: false,       // ponlo en true cuando tengas la llave
      publicKey: '',        // tu PUBLIC_KEY de ePayco
      test: true,           // true = modo pruebas; false = cobra de verdad
    },

    // Wompi (Bancolombia).
    wompi: {
      enabled: true,
      // MODO FÁCIL (sin backend): tu "link de pagos" de Wompi. Acepta tarjetas, Nequi y PSE.
      // El cliente paga el total en la página segura de Wompi.
      // Lo sacas en tu panel de Wompi → "Comparte tu link de pagos".
      paymentLink: 'https://checkout.wompi.co/l/VPOS_HwRmKl',
      // MODO EXACTO (activo): cobra el monto exacto automático con el widget + Worker de firma.
      publicKey: 'pub_prod_20s3b6HtkDjOBj27ga53lQ8PwmU9hwpQ',
      signatureEndpoint: 'https://wompi-firma.dev-sisa2026.workers.dev',
    },

    // Mercado Pago: necesita un backend que cree la "preferencia" y devuelva el init_point.
    mercadopago: {
      enabled: false,
      preferenceEndpoint: '', // URL de tu backend que devuelve { init_point }
    },
  },
};
