/*
 * Catálogo. Los productos de abajo son DE EJEMPLO: reemplázalos por los que elijas en Dropi.
 *
 *  id       identificador interno único
 *  dropiId  ID del producto en Dropi (para enlazar el pedido con tu proveedor)
 *  img      (opcional) URL de la foto real. Si está vacía se muestra un icono.
 *  price    precio de venta (COP)
 *  was      (opcional) precio anterior, para mostrar descuento
 *  badge    (opcional) "Nuevo", "Top", etc.
 */
window.CATEGORIES = [
  { id: 'audio', name: 'Audio', desc: 'Audífonos y parlantes', icon: 'earbuds' },
  { id: 'wearables', name: 'Wearables', desc: 'Relojes y bandas inteligentes', icon: 'watch' },
  { id: 'carga', name: 'Carga', desc: 'Cargadores y power banks', icon: 'charger' },
  { id: 'accesorios', name: 'Accesorios', desc: 'Fundas, soportes y más', icon: 'case' },
  { id: 'hogar', name: 'Hogar smart', desc: 'Bombillos, enchufes y cámaras', icon: 'bulb' },
  { id: 'creadores', name: 'Creadores', desc: 'Luces, trípodes y micrófonos', icon: 'ring' },
];

window.PRODUCTS = [
  {
    id: 'aud-001', dropiId: '', cat: 'audio', name: 'Audífonos TWS Pulse', badge: 'Top',
    short: 'Bluetooth 5.3 con cancelación de ruido y estuche de carga.',
    price: 79900, was: 109900, img: '', icon: 'earbuds',
    features: ['Bluetooth 5.3', 'Hasta 24 h con el estuche', 'Cancelación de ruido', 'Resistentes al sudor'],
  },
  {
    id: 'aud-002', dropiId: '', cat: 'audio', name: 'Parlante Cápsula 360', badge: '',
    short: 'Sonido envolvente, resistente al agua y con luces RGB.',
    price: 89900, was: 0, img: '', icon: 'speaker',
    features: ['Sonido 360°', 'Resistente al agua', 'Luces RGB', 'Batería de 12 h'],
  },
  {
    id: 'wea-001', dropiId: '', cat: 'wearables', name: 'Smartwatch Orbit S', badge: 'Nuevo',
    short: 'Pantalla AMOLED, pulsómetro, sueño y notificaciones.',
    price: 139900, was: 189900, img: '', icon: 'watch',
    features: ['Pantalla AMOLED 1.8"', 'Pulso y sueño', 'Notificaciones del celular', 'Sumergible IP68'],
  },
  {
    id: 'wea-002', dropiId: '', cat: 'wearables', name: 'Banda Fit Slim', badge: '',
    short: 'Pasos, calorías y pulso en una banda ligera.',
    price: 54900, was: 0, img: '', icon: 'band',
    features: ['Contador de pasos', 'Monitor de pulso', 'Batería de 10 días', 'Correa intercambiable'],
  },
  {
    id: 'car-001', dropiId: '', cat: 'carga', name: 'Cargador GaN 65W', badge: 'Top',
    short: 'Carga rápida para celular, tablet y portátil con un solo cargador.',
    price: 99900, was: 129900, img: '', icon: 'charger',
    features: ['65 W USB-C + USB-A', 'Tecnología GaN compacta', 'Protección térmica', 'Compatible con portátiles'],
  },
  {
    id: 'car-002', dropiId: '', cat: 'carga', name: 'Power Bank Magnético 10.000', badge: '',
    short: 'Se pega al celular y carga sin cables.',
    price: 109900, was: 0, img: '', icon: 'powerbank',
    features: ['10.000 mAh', 'Carga inalámbrica magnética', 'USB-C rápido', 'Ultra delgado'],
  },
  {
    id: 'acc-001', dropiId: '', cat: 'accesorios', name: 'Soporte Magnético para Carro', badge: '',
    short: 'Agarre firme, giro 360° y montaje en rejilla.',
    price: 39900, was: 54900, img: '', icon: 'stand',
    features: ['Imán de alta fuerza', 'Giro 360°', 'Instalación en 5 segundos', 'Compatible con MagSafe'],
  },
  {
    id: 'acc-002', dropiId: '', cat: 'accesorios', name: 'Funda Transparente Antigolpes', badge: '',
    short: 'Cristalina, con bordes reforzados y no amarillea.',
    price: 29900, was: 0, img: '', icon: 'case',
    features: ['Esquinas reforzadas', 'No amarillea', 'Cámara protegida', 'Varios modelos'],
  },
  {
    id: 'hog-001', dropiId: '', cat: 'hogar', name: 'Bombillo Wi-Fi RGB', badge: 'Nuevo',
    short: '16 millones de colores, controlado desde el celular.',
    price: 34900, was: 0, img: '', icon: 'bulb',
    features: ['16M de colores', 'Control por app', 'Compatible con voz', 'Programable'],
  },
  {
    id: 'hog-002', dropiId: '', cat: 'hogar', name: 'Enchufe Inteligente Wi-Fi', badge: '',
    short: 'Enciende y programa cualquier aparato desde donde estés.',
    price: 42900, was: 59900, img: '', icon: 'plug',
    features: ['Control remoto por app', 'Temporizador', 'Medidor de consumo', 'Compatible con voz'],
  },
  {
    id: 'hog-003', dropiId: '', cat: 'hogar', name: 'Cámara Wi-Fi 360° Full HD', badge: 'Top',
    short: 'Vigila tu casa desde el celular con visión nocturna.',
    price: 119900, was: 159900, img: '', icon: 'camera',
    features: ['Full HD 1080p', 'Giro 360°', 'Visión nocturna', 'Audio de dos vías'],
  },
  {
    id: 'cre-001', dropiId: '', cat: 'creadores', name: 'Ring Light con Trípode', badge: '',
    short: 'Luz regulable para videos, fotos y videollamadas.',
    price: 64900, was: 0, img: '', icon: 'ring',
    features: ['3 tonos de luz', 'Brillo regulable', 'Trípode extensible', 'Soporte de celular'],
  },
];

/* Iconos SVG (trazo) para las tarjetas cuando aún no hay foto real */
window.ICONS = {
  earbuds: '<path d="M14 8a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0v-8a4 4 0 0 0-4-4Z"/><path d="M14 24v10a2 2 0 0 0 4 0V24"/><path d="M34 8a4 4 0 0 1 4 4v8a4 4 0 0 1-8 0v-8a4 4 0 0 1 4-4Z"/><path d="M34 24v10a2 2 0 0 1-4 0V24"/>',
  speaker: '<rect x="14" y="6" width="20" height="36" rx="8"/><circle cx="24" cy="28" r="6"/><circle cx="24" cy="14" r="1.6"/>',
  watch: '<rect x="14" y="12" width="20" height="24" rx="6"/><path d="M18 12l1-6h10l1 6M18 36l1 6h10l1-6"/><path d="M24 20v5l3 2"/>',
  band: '<rect x="18" y="14" width="12" height="20" rx="4"/><path d="M19 14l1-8h8l1 8M19 34l1 8h8l1-8"/><path d="M22 22h4M22 26h4"/>',
  charger: '<rect x="12" y="14" width="24" height="22" rx="5"/><path d="M19 14V8M29 14V8M24 22l-3 5h6l-3 5"/>',
  powerbank: '<rect x="14" y="6" width="20" height="36" rx="6"/><path d="M24 17l-3 5h6l-3 5"/><path d="M20 36h8"/>',
  stand: '<rect x="14" y="8" width="20" height="26" rx="4"/><path d="M24 34v4M16 42h16"/>',
  case: '<rect x="14" y="6" width="20" height="36" rx="5"/><rect x="18" y="10" width="9" height="9" rx="2.5"/><circle cx="22.5" cy="14.5" r="1.6"/>',
  bulb: '<path d="M24 6a12 12 0 0 0-6 22c1 1 2 3 2 5h8c0-2 1-4 2-5a12 12 0 0 0-6-22Z"/><path d="M20 38h8M21 42h6"/>',
  plug: '<path d="M18 6v10M30 6v10"/><path d="M14 16h20v6a10 10 0 0 1-20 0v-6Z"/><path d="M24 32v10"/>',
  camera: '<rect x="8" y="16" width="32" height="20" rx="5"/><circle cx="24" cy="26" r="6"/><path d="M18 16l2-5h8l2 5"/>',
  ring: '<circle cx="24" cy="20" r="12"/><circle cx="24" cy="20" r="6"/><path d="M24 32v10M16 42h16"/>',
};
