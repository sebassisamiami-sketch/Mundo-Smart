/*
 * Catálogo REAL de Mundo Smart — productos tomados de tu catálogo de Dropi,
 * con el precio sugerido de Dropi y la foto + ID reales de cada producto (25 nov 2026).
 *
 *  id       identificador interno único
 *  dropiId  ID del producto en Dropi (sirve para crear/enlazar el pedido con Dropi)
 *  provider proveedor en Dropi (a quién le pides cuando entre una venta)
 *  img      foto real del producto (tomada del catálogo de Dropi)
 *  price    precio de venta (precio sugerido de Dropi, COP)
 */
var CDN = 'https://d39ru7awumhhs2.cloudfront.net/colombia/products/';

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
    id: 'aud-ambie', dropiId: '2176960', provider: 'ASTRID', cat: 'audio',
    name: 'Audífonos Ambie Sound Earcu', badge: 'Top',
    short: 'Audífonos inalámbricos con estuche de carga y manos libres.',
    price: 70000, was: 0,
    img: CDN + '2176960/1781543171D_NQ_NP_2X_881481-MCO94059063959_102025-F.webp',
    icon: 'earbuds',
    features: ['Conexión Bluetooth', 'Estuche de carga', 'Manos libres para llamadas', 'Uso diario'],
  },
  {
    id: 'aud-airdots', dropiId: '98941', provider: 'SOLUCIONES SHOP', cat: 'audio',
    name: 'Audífonos Bluetooth Xiaomi AirDots', badge: '',
    short: 'Audífonos inalámbricos compactos con buena autonomía.',
    price: 210000, was: 0,
    img: CDN + '98941/17023924001702392400dd2c8f25-cdda-4a9a-b695-f6882001183f_600x.jpeg',
    imgs: [
      CDN + '98941/17023924001702392400dd2c8f25-cdda-4a9a-b695-f6882001183f_600x.jpeg',
      CDN + '98941/17023924001702392400f393e648-5099-495b-8d4b-f3e7db7900a4.jpeg',
    ],
    icon: 'earbuds',
    features: ['Bluetooth estable', 'Diseño compacto', 'Estuche de carga', 'Control táctil'],
  },
  {
    id: 'aud-jk18', dropiId: '2098504', provider: 'TU CLICK', cat: 'audio',
    name: 'Audífonos Inalámbricos JKMX JK18', badge: '',
    short: 'Opción económica de audífonos inalámbricos para el día a día.',
    price: 39000, was: 0,
    img: CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082359.png',
    icon: 'earbuds',
    features: ['Bluetooth', 'Varios colores', 'Estuche de carga', 'Precio económico'],
  },
  {
    id: 'aud-movisun', dropiId: '2072830', provider: 'MOVISUN', cat: 'audio',
    name: 'Parlante Bluetooth Movisun Glumax 10W', badge: '',
    short: 'Parlante Bluetooth portátil de 10W con buen sonido para fiestas.',
    price: 89900, was: 0,
    img: CDN + '2072830/1770044704D_NQ_NP_2X_961308-MLA96871386825_102025-F.jpg',
    icon: 'speaker',
    features: ['Bluetooth', '10W de potencia', 'Portátil y recargable', 'Buen bajo'],
  },

  // ---------- WEARABLES ----------
  {
    id: 'wea-t500', dropiId: '1628933', provider: 'AARON IMPORTACIONES', cat: 'wearables',
    name: 'Smartwatch T500 Doble Pulso', badge: 'Top',
    short: 'Reloj inteligente con notificaciones y monitor de actividad.',
    price: 55000, was: 0,
    img: CDN + '1628933/1737055185WhatsApp%20Image%202025-01-16%20at%202.17.32%20PM.jpeg',
    icon: 'watch',
    features: ['Notificaciones del celular', 'Monitor de actividad', 'Pantalla táctil', 'Varias correas'],
  },
  {
    id: 'wea-ace280', dropiId: '2139907', provider: 'DROP SQUAD', cat: 'wearables',
    name: 'Combo Smartwatch Ace280', badge: 'Nuevo',
    short: 'Smartwatch con correas intercambiables, tipo combo completo.',
    price: 150000, was: 0,
    img: CDN + '2139907/1777345763535525954_1156308939877523_6977859766172269091_n.jpg',
    icon: 'watch',
    features: ['Correas intercambiables', 'Notificaciones', 'Monitor de salud', 'Combo completo'],
  },

  // ---------- CARGA ----------
  {
    id: 'car-tipoc', dropiId: '1936562', provider: 'ADRIATIK BRANDS', cat: 'carga',
    name: 'Cargador Tipo C Somostel (Cubo)', badge: '',
    short: 'Cubo de carga compacto con salida USB-C.',
    price: 25990, was: 0,
    img: CDN + '1936562/17606468244.png',
    imgs: [
      CDN + '1936562/17606468244.png',
      CDN + '1936562/176064682611.png',
      CDN + '1936562/176064682613.png',
      CDN + '1936562/17606468266.png',
      CDN + '1936562/176064682610.png',
      CDN + '1936562/17606468269.png',
      CDN + '1936562/176064682614.png',
      CDN + '1936562/17606468268.png',
      CDN + '1936562/1760646824Fotos_mercado_libr%20(93).png',
      CDN + '1936562/17606468241.png',
    ],
    icon: 'charger',
    features: ['Salida USB-C', 'Tamaño compacto', 'Carga para celular', 'Buen precio'],
  },
  {
    id: 'car-nanotec', dropiId: '2242225', provider: 'LIAMU TECH', cat: 'carga',
    name: 'Cargador de Carro Nanotec', badge: '',
    short: 'Cargador para el carro con varios puertos y luces LED.',
    price: 45000, was: 0,
    img: CDN + '2242225/img_6a90ec86f05701.22059631_0.jpg',
    icon: 'charger',
    features: ['Para carro', 'Varios puertos', 'Luces LED', 'Carga rápida'],
  },

  // ---------- HOGAR SMART ----------
  {
    id: 'hog-cam360', dropiId: '1518912', provider: '1986HITS', cat: 'hogar',
    name: 'Cámara Wifi Smart Seguridad 360°', badge: 'Top',
    short: 'Cámara de seguridad wifi con giro 360° que ves desde el celular.',
    price: 100000, was: 0,
    img: CDN + '1518912/1732303158D_NQ_NP_2X_903285-MCO77120009474_062024-F.webp',
    icon: 'camera',
    features: ['Giro 360°', 'Control por app', 'Visión nocturna', 'Audio de dos vías'],
  },
  {
    id: 'hog-tapo', dropiId: '2133668', provider: 'GRUPO CONTROL', cat: 'hogar',
    name: 'Cámara Wifi TP-Link Tapo', badge: '',
    short: 'Cámara wifi marca TP-Link que ves y controlas desde el celular.',
    price: 170706, was: 0,
    img: CDN + '2133668/1776724051eyJidWNrZXQiOiJ3YTEweC52MiIsImtleSI6Ijc5YTFjN2IzLWU0NzQtNDU4NS04ODFkLThjMDMzZWRiNmYwZS5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiaGVpZ2h0IjoxMDgwLCJmaXQiOiJjb250YWluIn0sInJvdGF0ZSI6bnVsbH19.webp',
    icon: 'camera',
    features: ['Marca TP-Link', 'Control por app', 'Seguimiento de movimiento', 'Visión nocturna'],
  },
  {
    id: 'hog-bombparlante', dropiId: '1987268', provider: 'BOODE+', cat: 'hogar',
    name: 'Bombillo Parlante Bluetooth RGB', badge: 'Nuevo',
    short: 'Bombillo LED RGB con parlante Bluetooth integrado y control remoto.',
    price: 40000, was: 0,
    img: CDN + '1987268/1762469417bombillo%20%20parlante1.png',
    icon: 'bulb',
    features: ['Luz RGB de colores', 'Parlante Bluetooth integrado', 'Control remoto', 'Fácil instalación'],
  },

  // ---------- CREADORES ----------
  {
    // Favoriteado en Dropi (ID 957884), pero su página de detalle no carga (parece
    // inactivo en ese proveedor), por eso quedó con icono. Se puede reemplazar por otro aro.
    id: 'cre-aro16', dropiId: '957884', provider: 'SOLUCIONES SHOP', cat: 'creadores',
    name: 'Aro de Luz 16 cm Profesional + Trípode', badge: '',
    short: 'Aro de luz con trípode para videos, fotos y videollamadas.',
    price: 75000, was: 0, img: '', icon: 'ring',
    features: ['16 cm de diámetro', 'Trípode incluido', 'Brillo regulable', 'Soporte de celular'],
  },
  {
    id: 'cre-arorgb', dropiId: '2336620', provider: 'IMPORTADORA A&N', cat: 'creadores',
    name: 'Aro de Luz RGB 26 cm + Trípode', badge: 'Nuevo',
    short: 'Aro de luz RGB grande con trípode, ideal para creadores de contenido.',
    price: 80000, was: 0,
    img: CDN + '2336620/img_6af4d20605ee34.82169658_0.jpg',
    icon: 'ring',
    features: ['Luz RGB de colores', '26 cm de diámetro', 'Trípode extensible', 'Control de brillo'],
  },
];

/* Iconos SVG (trazo) para las tarjetas sin foto */
window.ICONS = {
  earbuds: '<path d="M14 8a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0v-8a4 4 0 0 0-4-4Z"/><path d="M14 24v10a2 2 0 0 0 4 0V24"/><path d="M34 8a4 4 0 0 1 4 4v8a4 4 0 0 1-8 0v-8a4 4 0 0 1 4-4Z"/><path d="M34 24v10a2 2 0 0 1-4 0V24"/>',
  watch: '<rect x="14" y="12" width="20" height="24" rx="6"/><path d="M18 12l1-6h10l1 6M18 36l1 6h10l1-6"/><path d="M24 20v5l3 2"/>',
  charger: '<rect x="12" y="14" width="24" height="22" rx="5"/><path d="M19 14V8M29 14V8M24 22l-3 5h6l-3 5"/>',
  camera: '<rect x="8" y="16" width="32" height="20" rx="5"/><circle cx="24" cy="26" r="6"/><path d="M18 16l2-5h8l2 5"/>',
  ring: '<circle cx="24" cy="20" r="12"/><circle cx="24" cy="20" r="6"/><path d="M24 32v10M16 42h16"/>',
  speaker: '<rect x="14" y="6" width="20" height="36" rx="8"/><circle cx="24" cy="28" r="6"/><circle cx="24" cy="14" r="1.6"/>',
  bulb: '<path d="M24 6a12 12 0 0 0-6 22c1 1 2 3 2 5h8c0-2 1-4 2-5a12 12 0 0 0-6-22Z"/><path d="M20 38h8M21 42h6"/>',
};
