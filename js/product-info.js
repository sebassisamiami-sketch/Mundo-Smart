/*
 * Descripción y especificaciones de cada producto (se muestran al abrir el producto).
 * La garantía es general para toda la tienda y se configura en js/config.js (warranty).
 * Clave = id interno del producto (ver js/products.js).
 */
window.PRODUCT_INFO = {
  'car-powerbank': {
    description: 'Batería externa (power bank) de 10.000 mAh con carga inalámbrica magnética: se adhiere a la parte de atrás de tu iPhone y lo carga sin cables. Compacta para llevar en el bolsillo, ideal para no quedarte sin batería durante el día.',
    specs: ['Capacidad: 10.000 mAh', 'Carga: Inalámbrica magnética', 'Compatibilidad: iPhone (MagSafe) y celulares con carga inalámbrica', 'Puerto: USB-C', 'Tamaño: Compacto y portátil'],
  },
  'aud-ambie': {
    description: 'Audífonos inalámbricos tipo clip que se ajustan a la oreja sin tapar el oído, cómodos para usar todo el día. Se conectan por Bluetooth a tu celular para escuchar música y contestar llamadas con manos libres, y vienen con estuche que los recarga cuando no los usas.',
    specs: ['Conexión: Bluetooth inalámbrico', 'Formato: Clip de oreja (open-ear)', 'Micrófono: Sí, manos libres', 'Estuche de carga: Incluido', 'Compatibilidad: Android y iPhone', 'Recarga: Cable USB'],
  },
  'aud-airdots': {
    description: 'Audífonos Bluetooth compactos y livianos, fáciles de llevar a cualquier parte. Conexión estable para música y llamadas, control táctil y estuche que los mantiene cargados.',
    specs: ['Conexión: Bluetooth', 'Formato: In-ear inalámbricos', 'Control: Táctil', 'Micrófono: Sí', 'Estuche de carga: Incluido', 'Compatibilidad: Android y iPhone'],
  },
  'aud-jk18': {
    description: 'Audífonos inalámbricos económicos para el día a día. Buena opción de entrada: se conectan por Bluetooth, traen estuche de carga y vienen en varios colores.',
    specs: ['Conexión: Bluetooth', 'Formato: In-ear inalámbricos', 'Estuche de carga: Incluido', 'Colores: Varios', 'Micrófono: Sí', 'Compatibilidad: Android y iPhone'],
  },
  'aud-movisun': {
    description: 'Parlante Bluetooth portátil de 10W con buen volumen y bajos para animar cualquier reunión. Recargable y fácil de llevar; se conecta por Bluetooth a tu celular.',
    specs: ['Potencia: 10W', 'Conexión: Bluetooth', 'Tipo: Portátil recargable', 'Batería: Recargable por USB', 'Uso: Interior y exterior'],
  },
  'wea-t500': {
    description: 'Reloj inteligente que muestra las notificaciones de tu celular, la hora y tu actividad física. Pantalla táctil y correa cambiable; se vincula con tu teléfono por Bluetooth.',
    specs: ['Pantalla: Táctil', 'Conexión: Bluetooth', 'Funciones: Notificaciones y actividad', 'Correa: Intercambiable', 'Compatibilidad: Android y iPhone', 'Recarga: Magnética USB'],
  },
  'wea-ace280': {
    description: 'Combo de smartwatch con correas intercambiables para cambiar de estilo cuando quieras. Muestra notificaciones, monitorea tu actividad y se vincula con tu celular.',
    specs: ['Pantalla: Táctil', 'Conexión: Bluetooth', 'Incluye: Correas intercambiables', 'Funciones: Notificaciones y salud', 'Compatibilidad: Android y iPhone', 'Recarga: USB'],
  },
  'car-tipoc': {
    description: 'Cubo de carga compacto con salida USB-C para cargar tu celular en casa o la oficina. Tamaño pequeño y fácil de llevar.',
    specs: ['Entrada: 110–220V', 'Salida: USB-C', 'Tipo: Cargador de pared', 'Tamaño: Compacto'],
  },
  'car-nanotec': {
    description: 'Cargador para el carro con varios puertos USB y luces LED, para cargar tu celular y otros dispositivos mientras conduces. Carga rápida y fácil de conectar.',
    specs: ['Tipo: Cargador para carro (12–24V)', 'Puertos: Varios USB', 'Luces: LED', 'Uso: Carga en el vehículo'],
  },
  'hog-cam360': {
    description: 'Cámara de seguridad wifi que ves en vivo desde tu celular estés donde estés. Gira 360°, tiene visión nocturna y audio de dos vías para hablar y escuchar.',
    specs: ['Conexión: WiFi', 'Giro: 360°', 'Visión nocturna: Sí', 'Audio: Dos vías', 'App: Control desde el celular', 'Almacenamiento: MicroSD o nube (según app)'],
  },
  'hog-tapo': {
    description: 'Cámara wifi marca TP-Link (línea Tapo) para vigilar tu casa o negocio desde el celular. Seguimiento de movimiento, visión nocturna y control por la app Tapo.',
    specs: ['Marca: TP-Link (Tapo)', 'Conexión: WiFi', 'Visión nocturna: Sí', 'Detección: Movimiento', 'App: Tapo', 'Almacenamiento: MicroSD o nube'],
  },
  'hog-bombparlante': {
    description: 'Bombillo LED que cambia de color (RGB) y además es parlante Bluetooth: ilumina y suena al mismo tiempo. Se enrosca como un bombillo normal y se controla con control remoto.',
    specs: ['Luz: LED RGB (colores)', 'Parlante: Bluetooth integrado', 'Control: Remoto incluido', 'Montura: Rosca estándar E27', 'Uso: Ambiente y música'],
  },
  'acc-tripode': {
    description: 'Trípode de patas flexibles que se enrolla y se agarra a casi cualquier superficie para grabar, hacer fotos o ver videos sin sostener el celular. Liviano y con soporte universal.',
    specs: ['Patas: Flexibles', 'Soporte: Universal para celular', 'Material: Liviano', 'Uso: Fotos, videos y videollamadas'],
  },
  'acc-cuello': {
    description: 'Soporte de cuello manos libres para ver videos, grabar o hacer videollamadas sin cansar los brazos. Flexible y ajustable; se acomoda a tu postura.',
    specs: ['Tipo: Soporte de cuello', 'Ajuste: Flexible', 'Uso: Manos libres', 'Colores: Varios'],
  },
  'acc-carrochupa': {
    description: 'Soporte para el carro con ventosa fuerte que se pega al vidrio o al panel. Giro 360° y agarre firme para usar el GPS o contestar con manos libres.',
    specs: ['Montaje: Ventosa', 'Giro: 360°', 'Ubicación: Vidrio o panel', 'Agarre: Firme y ajustable'],
  },
  'acc-carrorej': {
    description: 'Soporte de celular para el carro compatible con todas las referencias. Fácil de instalar y con agarre seguro para que tu celular no se mueva.',
    specs: ['Compatibilidad: Universal', 'Instalación: Fácil', 'Agarre: Seguro', 'Uso: GPS y manos libres'],
  },
  'cre-mic3en1': {
    description: 'Micrófono de solapa inalámbrico para grabar videos con sonido claro. Incluye adaptadores para iPhone, celulares USB-C y cámara, y reduce el ruido del ambiente.',
    specs: ['Conexión: Inalámbrica', 'Compatibilidad: iPhone, USB-C y cámara', 'Reducción de ruido: Sí', 'Uso: Videos y entrevistas', 'Recarga: USB'],
  },
  'cre-micm10': {
    description: 'Micrófono de mano inalámbrico ideal para karaoke, presentaciones y eventos. Sonido claro, recargable y fácil de usar.',
    specs: ['Tipo: Micrófono de mano', 'Conexión: Inalámbrica', 'Uso: Karaoke y eventos', 'Batería: Recargable'],
  },
  'cre-micn8': {
    description: 'Par de micrófonos de solapa inalámbricos para grabar con dos personas a la vez. Perfectos para entrevistas y contenido en pareja.',
    specs: ['Incluye: 2 micrófonos', 'Conexión: Inalámbrica', 'Uso: Entrevistas y videos con 2 personas', 'Recarga: USB'],
  },
  'cre-aro16': {
    description: 'Aro de luz de 16 cm con trípode para mejorar tus videos, fotos y videollamadas. Brillo regulable y soporte para el celular incluido.',
    specs: ['Diámetro: 16 cm', 'Trípode: Incluido', 'Brillo: Regulable', 'Soporte: Para celular', 'Alimentación: USB'],
  },
  'cre-arorgb': {
    description: 'Aro de luz RGB grande (26 cm) con trípode extensible, ideal para creadores de contenido. Luz de colores y brillo ajustable para lograr el ambiente que quieras.',
    specs: ['Diámetro: 26 cm', 'Colores: Luz RGB', 'Trípode: Extensible', 'Brillo: Ajustable', 'Alimentación: USB'],
  },
};
