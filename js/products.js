/*
 * Catálogo REAL de Mundo Smart — productos tomados de tu catálogo de Dropi,
 * con el precio sugerido de Dropi y las fotos reales de la galería de cada producto.
 *
 *  id       identificador interno único
 *  dropiId  ID del producto en Dropi (sirve para crear/enlazar el pedido con Dropi)
 *  provider proveedor en Dropi (a quién le pides cuando entre una venta)
 *  img      foto principal (primera de la galería)
 *  imgs     galería completa (carrusel) — fotos reales tomadas de Dropi
 *  price    precio de venta (precio sugerido de Dropi, COP)
 */
var CDN = 'https://d39ru7awumhhs2.cloudfront.net/colombia/products/';

window.CATEGORIES = [
  { id: 'audio', name: 'Audio', desc: 'Audífonos inalámbricos', icon: 'earbuds' },
  { id: 'wearables', name: 'Wearables', desc: 'Relojes inteligentes', icon: 'watch' },
  { id: 'carga', name: 'Carga', desc: 'Cargadores', icon: 'charger' },
  { id: 'hogar', name: 'Hogar smart', desc: 'Cámaras y seguridad wifi', icon: 'camera' },
  { id: 'accesorios', name: 'Accesorios', desc: 'Soportes para celular', icon: 'stand' },
  { id: 'creadores', name: 'Creadores', desc: 'Aros de luz y trípodes', icon: 'ring' },
];

window.PRODUCTS = [
  // ---------- DESTACADO ----------
  {
    id: 'car-powerbank', dropiId: '2154855', provider: 'ONE TECH', cat: 'carga',
    name: 'Power Bank iPhone 10.000 mAh Magnético', badge: 'Top',
    short: 'Batería externa magnética de 10.000 mAh para iPhone: carga sin cables.',
    price: 59900, was: 0,
    img: 'assets/products/powerbank-cafe.jpg',
    imgs: [
      'assets/products/powerbank-cafe.jpg',
      CDN + '2154855/177929441817727410631764691589images%20(37).jpeg',
      CDN + '2154855/177929441817727410631764691589D_NQ_NP_705913-MCO69686630347_052023-O.webp',
    ],
    icon: 'charger',
    features: ['Capacidad 10.000 mAh', 'Magnético (se pega al iPhone)', 'Carga inalámbrica', 'Compacto y portátil'],
  },

  // ---------- AUDIO ----------
  {
    id: 'aud-ambie', dropiId: '2176960', provider: 'ASTRID', cat: 'audio',
    name: 'Audífonos Ambie Sound Earcu', badge: 'Top',
    short: 'Audífonos inalámbricos con estuche de carga y manos libres.',
    price: 80000, was: 0,
    img: CDN + '2176960/1781543171D_NQ_NP_2X_881481-MCO94059063959_102025-F.webp',
    imgs: [
      CDN + '2176960/1781543171D_NQ_NP_2X_881481-MCO94059063959_102025-F.webp',
      CDN + '2176960/1781543171D_NQ_NP_2X_639120-MCO94054912181_102025-F.webp',
      CDN + '2176960/1781543171D_NQ_NP_2X_963746-MCO93634177514_102025-F.webp',
      CDN + '2176960/1781543171D_NQ_NP_2X_676081-MCO93634179458_102025-F.webp',
      CDN + '2176960/1781543171D_NQ_NP_2X_892103-MCO94054972281_102025-F.webp',
    ],
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
    name: 'Audífonos Inalámbricos JKMX JK100', badge: '',
    short: 'Opción económica de audífonos inalámbricos para el día a día.',
    price: 49000, was: 0,
    img: CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082359.png',
    imgs: [
      CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082359.png',
      CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082419.png',
      CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082425.png',
      CDN + '2098504/1772547935Captura%20de%20pantalla%202026-03-03%20082414.png',
    ],
    icon: 'earbuds',
    features: ['Bluetooth', 'Varios colores', 'Estuche de carga', 'Precio económico'],
  },
  {
    id: 'aud-movisun', dropiId: '2072830', provider: 'MOVISUN', cat: 'audio',
    name: 'Parlante Bluetooth Movisun Glumax 10W', badge: '',
    short: 'Parlante Bluetooth portátil de 10W con buen sonido para fiestas.',
    price: 99900, was: 0,
    img: CDN + '2072830/1770044704D_NQ_NP_2X_961308-MLA96871386825_102025-F.jpg',
    imgs: [
      CDN + '2072830/1770044704D_NQ_NP_2X_961308-MLA96871386825_102025-F.jpg',
      CDN + '2072830/1770044704D_NQ_NP_2X_761303-MLA93157379858_092025-F.jpg',
      CDN + '2072830/1770044704D_NQ_NP_2X_985124-MLA93573978267_092025-F.jpg',
    ],
    icon: 'speaker',
    features: ['Bluetooth', '10W de potencia', 'Portátil y recargable', 'Buen bajo'],
  },

  // ---------- WEARABLES ----------
  {
    id: 'wea-t500', dropiId: '1628933', provider: 'AARON IMPORTACIONES', cat: 'wearables',
    name: 'Smartwatch T500 Doble Pulso', badge: 'Top',
    short: 'Reloj inteligente con notificaciones y monitor de actividad.',
    price: 65000, was: 0,
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
    imgs: [
      CDN + '2139907/1777345763535525954_1156308939877523_6977859766172269091_n.jpg',
      CDN + '2139907/1777345765534496243_1156308999877517_3018157657121597574_n.jpg',
      CDN + '2139907/1777345763536173144_1156309066544177_7477905725678914444_n.jpg',
    ],
    icon: 'watch',
    features: ['Correas intercambiables', 'Notificaciones', 'Monitor de salud', 'Combo completo'],
  },

  // ---------- CARGA ----------
  {
    id: 'car-tipoc', dropiId: '1936562', provider: 'ADRIATIK BRANDS', cat: 'carga',
    name: 'Cargador Tipo C Somostel (Cubo)', badge: '',
    short: 'Cubo de carga compacto con salida USB-C.',
    price: 35990, was: 0,
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
    // ⚠️ REVISAR: el ID 2242225 en Dropi corresponde a "Parlante NanoTec 1178",
    // NO a un cargador de carro. Falta el ID correcto del cargador Nanotec.
    id: 'car-nanotec', dropiId: '2242225', provider: 'LIAMU TECH', cat: 'carga',
    name: 'Cargador de Carro Nanotec', badge: '',
    short: 'Cargador para el carro con varios puertos y luces LED.',
    price: 55000, was: 0,
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
    imgs: [
      CDN + '1518912/1732303158D_NQ_NP_2X_903285-MCO77120009474_062024-F.webp',
      CDN + '1518912/1732303159D_NQ_NP_2X_750183-MCO77120317498_062024-F.webp',
      CDN + '1518912/1732303158D_NQ_NP_2X_844182-MCO77332504601_062024-F.webp',
      CDN + '1518912/1732303158D_NQ_NP_2X_930144-MCO77120009514_062024-F.webp',
    ],
    icon: 'camera',
    features: ['Giro 360°', 'Control por app', 'Visión nocturna', 'Audio de dos vías'],
  },
  {
    // ⚠️ REVISAR: el ID 2133668 en Dropi corresponde a "Tapón Protector Bajo Puerta",
    // NO a una cámara TP-Link Tapo. Falta el ID correcto de la cámara Tapo.
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
    price: 50000, was: 0,
    img: CDN + '1987268/1762469417bombillo%20%20parlante1.png',
    imgs: [
      CDN + '1987268/1762469417bombillo%20%20parlante1.png',
      CDN + '1987268/1762469417bombillo%20%20parlante.png',
      CDN + '1987268/1762469417bombillo%20bluetooth5.png',
      CDN + '1987268/1762469417bombillo%20%20parlante2.png',
    ],
    icon: 'bulb',
    features: ['Luz RGB de colores', 'Parlante Bluetooth integrado', 'Control remoto', 'Fácil instalación'],
  },

  // ---------- ACCESORIOS ----------
  {
    id: 'acc-tripode', dropiId: '2180548', provider: 'MARTVENTAS', cat: 'accesorios',
    name: 'Trípode Flexible Soporte Celular', badge: 'Top',
    short: 'Trípode flexible que se adapta a cualquier superficie para grabar o ver videos.',
    price: 65000, was: 0,
    img: CDN + '2180548/17818328551qal%C3%B1%7B.jpg',
    imgs: [
      CDN + '2180548/17818328551qal%C3%B1%7B.jpg',
      CDN + '2180548/1781832855seb777.jpg',
      CDN + '2180548/1781832855sbm953r.jpg',
      CDN + '2180548/1781832855azw2222.jpg',
    ],
    icon: 'stand',
    features: ['Patas flexibles', 'Se agarra a cualquier superficie', 'Soporte universal', 'Ligero'],
  },
  {
    id: 'acc-cuello', dropiId: '2032917', provider: 'BOODE+', cat: 'accesorios',
    name: 'Soporte Celular de Cuello Holder', badge: '',
    short: 'Soporte de cuello manos libres para ver videos cómodamente.',
    price: 45000, was: 0,
    img: CDN + '2032917/176789187541vnAsmmQpL._AC_.jpg',
    imgs: [
      CDN + '2032917/176789187541vnAsmmQpL._AC_.jpg',
      CDN + '2032917/1767891876soporte%20cuello%201.png',
      CDN + '2032917/1767891876soporte%20cuello%203.png',
      CDN + '2032917/1767891876soporte%20cuello%20rosa1.png',
      CDN + '2032917/1767891876soporte%20cuello%202.png',
    ],
    icon: 'stand',
    features: ['Manos libres', 'Flexible y ajustable', 'Cómodo para el cuello', 'Varios colores'],
  },
  {
    id: 'acc-carrochupa', dropiId: '1734191', provider: 'HELMAN', cat: 'accesorios',
    name: 'Soporte Celular Carro con Ventosa', badge: '',
    short: 'Soporte para el carro con ventosa, giro 360° y agarre firme.',
    price: 39000, was: 0,
    img: CDN + '1734191/1743090360D_NQ_NP_856602-MLA82567556169_022025-O.png',
    imgs: [
      CDN + '1734191/1743090360D_NQ_NP_856602-MLA82567556169_022025-O.png',
      CDN + '1734191/1743090360D_NQ_NP_988218-MLA79477430548_102024-O.png',
      CDN + '1734191/1743090360D_NQ_NP_875138-MLA79723754621_102024-O.png',
    ],
    icon: 'stand',
    features: ['Ventosa fuerte', 'Giro 360°', 'Para el panel o vidrio', 'Agarre firme'],
  },
  {
    id: 'acc-carrorej', dropiId: '844494', provider: 'DIEGO', cat: 'accesorios',
    name: 'Soporte Celular Carro Universal', badge: '',
    short: 'Soporte de carro compatible con todas las referencias de celular.',
    price: 33000, was: 0,
    img: CDN + '844494/1715220505PP1.jpg',
    imgs: [
      CDN + '844494/1715220505PP1.jpg',
      CDN + '844494/1715220505PP2.jpg',
      CDN + '844494/1715220505PP3.jpg',
    ],
    icon: 'stand',
    features: ['Universal', 'Instalación fácil', 'Agarre seguro', 'Buen precio'],
  },

  // ---------- CREADORES ----------
  {
    id: 'cre-mic3en1', dropiId: '1924491', provider: 'TV MARKET ONLINE', cat: 'creadores',
    name: 'Micrófono Inalámbrico 3 en 1', badge: 'Top',
    short: 'Micrófono de solapa inalámbrico con adaptadores para celular y cámara.',
    price: 80000, was: 0,
    img: CDN + '1924491/17577174891.jpeg',
    imgs: [
      CDN + '1924491/17577174891.jpeg',
      CDN + '1924491/17577174893.jpeg',
      CDN + '1924491/17577174894.jpeg',
      CDN + '1924491/17577174896.jpeg',
      CDN + '1924491/17577174895.jpeg',
      CDN + '1924491/17577174892.jpeg',
    ],
    icon: 'mic',
    features: ['Inalámbrico', 'Compatible iPhone, USB-C y cámara', 'Reduce ruido', 'Ideal para videos'],
  },
  {
    id: 'cre-micm10', dropiId: '2247301', provider: 'GEEKA MARKET', cat: 'creadores',
    name: 'Micrófono Inalámbrico M10', badge: '',
    short: 'Micrófono de mano inalámbrico, ideal para karaoke y presentaciones.',
    price: 95000, was: 0,
    img: CDN + '2247301/7a882aaf-b3c4-44b9-b2e4-31b3293bb659.png',
    imgs: [
      CDN + '2247301/7a882aaf-b3c4-44b9-b2e4-31b3293bb659.png',
      CDN + '2247301/a1367d65-4fa1-4b6a-a09e-0f2032a27cf1.png',
      CDN + '2247301/3d455710-71c6-45f0-9582-8a399bab9e35.png',
      CDN + '2247301/e17e0d97-d0bd-4d6f-8e71-be51e47ce145.png',
      CDN + '2247301/d9dd0d9a-d95c-4f2c-9df8-e650640df5fa.png',
      CDN + '2247301/66ac2d39-c93f-4a7b-a04d-34799819b18d.png',
    ],
    icon: 'mic',
    features: ['Inalámbrico', 'Sonido claro', 'Para karaoke y eventos', 'Recargable'],
  },
  {
    id: 'cre-micn8', dropiId: '2287302', provider: 'GM', cat: 'creadores',
    name: 'Micrófono Inalámbrico Doble Neepho N8', badge: '',
    short: 'Par de micrófonos de solapa inalámbricos para grabar con 2 personas.',
    price: 51900, was: 0,
    img: CDN + '2287302/img_6abeba9121c644.49588842_0.png',
    icon: 'mic',
    features: ['2 micrófonos', 'Inalámbricos', 'Para entrevistas y videos', 'Fácil de usar'],
  },
  {
    id: 'cre-aro16', dropiId: '957884', provider: 'SOLUCIONES SHOP', cat: 'creadores',
    name: 'Aro de Luz 16 cm Profesional + Trípode', badge: '',
    short: 'Aro de luz con trípode para videos, fotos y videollamadas.',
    price: 85000, was: 0,
    img: CDN + '957884/17205525372d777a2c-6415-44a0-a736-de05eeaddcc6.jpeg',
    imgs: [
      CDN + '957884/17205525372d777a2c-6415-44a0-a736-de05eeaddcc6.jpeg',
      CDN + '957884/1720552537c2df967f-9b91-40ca-b2c9-b0ad1f817fcf.jpeg',
      CDN + '957884/17205525373342a45a-5b35-4996-85ce-2659a9390330.jpeg',
    ],
    icon: 'ring',
    features: ['16 cm de diámetro', 'Trípode incluido', 'Brillo regulable', 'Soporte de celular'],
  },
  {
    id: 'cre-arorgb', dropiId: '2336620', provider: 'IMPORTADORA A&N', cat: 'creadores',
    name: 'Aro de Luz RGB 26 cm + Trípode', badge: 'Nuevo',
    short: 'Aro de luz RGB grande con trípode, ideal para creadores de contenido.',
    price: 90000, was: 0,
    img: CDN + '2336620/img_6af4d20605ee34.82169658_0.jpg',
    imgs: [
      CDN + '2336620/img_6af4d20605ee34.82169658_0.jpg',
      CDN + '2336620/img_6af4d2065ebeb5.92510977_2.jpg',
      CDN + '2336620/img_6af4d206335e22.40158875_1.jpg',
    ],
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
  stand: '<rect x="15" y="6" width="18" height="28" rx="3"/><rect x="19" y="10" width="10" height="16" rx="1.5"/><path d="M24 34v5M16 42h16"/>',
  mic: '<rect x="18" y="6" width="12" height="22" rx="6"/><path d="M14 22a10 10 0 0 0 20 0M24 32v8M18 42h12"/>',
};
