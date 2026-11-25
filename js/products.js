/*
 * Catálogo REAL de Mundo Smart — productos tomados de tu catálogo de Dropi,
 * con el precio sugerido de Dropi (25 nov 2026).
 *
 *  id       identificador interno único
 *  dropiId  ID del producto en Dropi. Está vacío por ahora: se llena cuando
 *           conectemos el backend/API para que el pedido entre automático a Dropi.
 *  provider proveedor en Dropi (a quién le pides cuando entre una venta)
 *  img      (opcional) URL de la foto. Vacío = se muestra un icono. Puedes pegar aquí
 *           el link de la foto real de Dropi cuando quieras.
 *  price    precio de venta (precio sugerido de Dropi, COP)
 */
window.CATEGORIES = [
  { id: 'audio', name: 'Audio', desc: 'Audífonos inalámbricos', icon: 'earbuds' },
  { id: 'wearables', name: 'Wearables', desc: 'Relojes inteligentes', icon: 'watch' },
  { id: 'carga', name: 'Carga', desc: 'Cargadores', icon: 'charger' },
  { id: 'hogar', name: 'Hogar smart', desc: 'Cámaras y seguridad wifi', icon: 'camera' },
  { id: 'creadores', name: 'Creadores', desc: 'Aros de luz y trípodes', icon: 'ring' },
];

window.PRODUCTS = [
  // ---------- AUDIO ----------
  {
    id: 'aud-ambie', dropiId: '', provider: 'ASTRID', cat: 'audio',
    name: 'Audífonos Ambie Sound Earcu', badge: 'Top',
    short: 'Audífonos inalámbricos con estuche de carga y manos libres.',
    price: 70000, was: 0, img: '', icon: 'earbuds',
    features: ['Conexión Bluetooth', 'Estuche de carga', 'Manos libres para llamadas', 'Uso diario'],
  },
  {
    id: 'aud-airdots', dropiId: '', provider: 'SOLUCIONES SHOP', cat: 'audio',
    name: 'Audífonos Bluetooth Xiaomi AirDots', badge: '',
    short: 'Audífonos inalámbricos compactos con buena autonomía.',
    price: 210000, was: 0, img: '', icon: 'earbuds',
    features: ['Bluetooth estable', 'Diseño compacto', 'Estuche de carga', 'Control táctil'],
  },
  {
    id: 'aud-jk18', dropiId: '', provider: 'TU CLICK', cat: 'audio',
    name: 'Audífonos Inalámbricos JKMX JK18', badge: '',
    short: 'Opción económica de audífonos inalámbricos para el día a día.',
    price: 39000, was: 0, img: '', icon: 'earbuds',
    features: ['Bluetooth', 'Varios colores', 'Estuche de carga', 'Precio económico'],
  },

  // ---------- WEARABLES ----------
  {
    id: 'wea-t500', dropiId: '', provider: 'AARON IMPORTACIONES', cat: 'wearables',
    name: 'Smartwatch T500 Doble Pulso', badge: 'Top',
    short: 'Reloj inteligente con notificaciones y monitor de actividad.',
    price: 55000, was: 0, img: '', icon: 'watch',
    features: ['Notificaciones del celular', 'Monitor de actividad', 'Pantalla táctil', 'Varias correas'],
  },
  {
    id: 'wea-ace280', dropiId: '', provider: 'DROP SQUAD', cat: 'wearables',
    name: 'Combo Smartwatch Ace280', badge: 'Nuevo',
    short: 'Smartwatch con correas intercambiables, tipo combo completo.',
    price: 150000, was: 0, img: '', icon: 'watch',
    features: ['Correas intercambiables', 'Notificaciones', 'Monitor de salud', 'Combo completo'],
  },

  // ---------- CARGA ----------
  {
    id: 'car-tipoc', dropiId: '', provider: 'ADRIATIK BRANDS', cat: 'carga',
    name: 'Cargador Tipo C Somostel (Cubo)', badge: '',
    short: 'Cubo de carga compacto con salida USB-C.',
    price: 25990, was: 0, img: '', icon: 'charger',
    features: ['Salida USB-C', 'Tamaño compacto', 'Carga para celular', 'Buen precio'],
  },
  {
    id: 'car-nanotec', dropiId: '', provider: 'LIAMU TECH', cat: 'carga',
    name: 'Cargador de Carro Nanotec', badge: '',
    short: 'Cargador para el carro con varios puertos y luces LED.',
    price: 45000, was: 0, img: '', icon: 'charger',
    features: ['Para carro', 'Varios puertos', 'Luces LED', 'Carga rápida'],
  },

  // ---------- HOGAR SMART ----------
  {
    id: 'hog-cam360', dropiId: '', provider: '1986HITS', cat: 'hogar',
    name: 'Cámara Wifi Smart Seguridad 360°', badge: 'Top',
    short: 'Cámara de seguridad wifi con giro 360° que ves desde el celular.',
    price: 100000, was: 0, img: '', icon: 'camera',
    features: ['Giro 360°', 'Control por app', 'Visión nocturna', 'Audio de dos vías'],
  },
  {
    id: 'hog-tapo', dropiId: '', provider: 'GRUPO CONTROL', cat: 'hogar',
    name: 'Cámara Wifi TP-Link Tapo TC72 2K', badge: '',
    short: 'Cámara wifi marca TP-Link con resolución 2K y seguimiento.',
    price: 170706, was: 0, img: '', icon: 'camera',
    features: ['Resolución 2K', 'Marca TP-Link', 'Seguimiento de movimiento', 'Visión nocturna'],
  },

  // ---------- CREADORES ----------
  {
    id: 'cre-aro16', dropiId: '', provider: 'SOLUCIONES SHOP', cat: 'creadores',
    name: 'Aro de Luz 16 cm Profesional + Trípode', badge: '',
    short: 'Aro de luz con trípode para videos, fotos y videollamadas.',
    price: 75000, was: 0, img: '', icon: 'ring',
    features: ['16 cm de diámetro', 'Trípode incluido', 'Brillo regulable', 'Soporte de celular'],
  },
  {
    id: 'cre-arorgb', dropiId: '', provider: 'IMPORTADORA A&N', cat: 'creadores',
    name: 'Aro de Luz RGB 26 cm + Trípode', badge: 'Nuevo',
    short: 'Aro de luz RGB grande con trípode, ideal para creadores de contenido.',
    price: 80000, was: 0, img: '', icon: 'ring',
    features: ['Luz RGB de colores', '26 cm de diámetro', 'Trípode extensible', 'Control de brillo'],
  },
];

/* Iconos SVG (trazo) para las tarjetas mientras no haya foto real */
window.ICONS = {
  earbuds: '<path d="M14 8a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0v-8a4 4 0 0 0-4-4Z"/><path d="M14 24v10a2 2 0 0 0 4 0V24"/><path d="M34 8a4 4 0 0 1 4 4v8a4 4 0 0 1-8 0v-8a4 4 0 0 1 4-4Z"/><path d="M34 24v10a2 2 0 0 1-4 0V24"/>',
  watch: '<rect x="14" y="12" width="20" height="24" rx="6"/><path d="M18 12l1-6h10l1 6M18 36l1 6h10l1-6"/><path d="M24 20v5l3 2"/>',
  charger: '<rect x="12" y="14" width="24" height="22" rx="5"/><path d="M19 14V8M29 14V8M24 22l-3 5h6l-3 5"/>',
  camera: '<rect x="8" y="16" width="32" height="20" rx="5"/><circle cx="24" cy="26" r="6"/><path d="M18 16l2-5h8l2 5"/>',
  ring: '<circle cx="24" cy="20" r="12"/><circle cx="24" cy="20" r="6"/><path d="M24 32v10M16 42h16"/>',
};
