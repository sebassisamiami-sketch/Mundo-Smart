/*
 * legal-content.js — Textos legales editables + renderizador compartido.
 *
 * window.LEGAL.defaults : el texto actual de Términos y Privacidad (en formato
 *   sencillo: "## Título" para subtítulos, "- " para viñetas, línea en blanco
 *   separa párrafos, **negrita** y [texto](enlace)).
 * window.LEGAL.render(md): convierte ese texto a HTML seguro.
 *
 * Lo usan el panel (para editar) y las páginas terminos.html / privacidad.html
 * (para mostrar la versión guardada por el administrador, si existe).
 */
(function () {
  function render(md) {
    function esc(s) {
      return String(s).replace(/[&<>]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
      });
    }
    function inline(s) {
      s = esc(s);
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        return '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>';
      });
      return s;
    }
    var lines = String(md || '').replace(/\r/g, '').split('\n');
    var out = [], list = null;
    function closeList() { if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; } }
    lines.forEach(function (ln) {
      var t = ln.trim();
      if (!t) { closeList(); return; }
      if (t.indexOf('## ') === 0) { closeList(); out.push('<h2>' + inline(t.slice(3)) + '</h2>'); return; }
      if (t.indexOf('# ') === 0) { closeList(); out.push('<h1>' + inline(t.slice(2)) + '</h1>'); return; }
      if (t.indexOf('- ') === 0) { if (!list) list = []; list.push('<li>' + inline(t.slice(2)) + '</li>'); return; }
      closeList(); out.push('<p>' + inline(t) + '</p>');
    });
    closeList();
    return out.join('\n');
  }

  var terminos = [
    '## 1. Aceptación de los términos',
    'Bienvenido a **Mundo Smart**. Al ingresar, navegar o realizar una compra en este sitio web, aceptas estos Términos y Condiciones y nuestra Política de Uso. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.',
    '',
    '## 2. Política de uso del sitio',
    'Puedes usar este sitio únicamente con fines lícitos y personales, para conocer nuestros productos y realizar pedidos. Al usarlo, te comprometes a:',
    '- No utilizar el sitio para actividades fraudulentas, ilegales o que afecten a terceros.',
    '- No intentar dañar, sobrecargar, vulnerar o acceder sin autorización a la plataforma o a sus sistemas.',
    '- Proporcionar información veraz y actualizada al realizar un pedido.',
    '- No reproducir, copiar ni usar el contenido del sitio con fines comerciales sin autorización.',
    'Mundo Smart podrá suspender o restringir el acceso a quien incumpla esta política o haga un uso indebido del sitio.',
    '',
    '## 3. Productos y precios',
    'Los productos mostrados dependen de la disponibilidad de nuestros proveedores y pueden variar sin previo aviso. Todos los precios están expresados en **pesos colombianos (COP)** e incluyen los impuestos aplicables. En caso de un error evidente de precio o descripción, Mundo Smart podrá cancelar el pedido afectado e informarte oportunamente.',
    '',
    '## 4. Proceso de compra',
    'Para realizar un pedido agregas los productos al carrito y completas tus datos de contacto y entrega. La compra se confirma una vez validamos la disponibilidad y los datos de envío. Podremos contactarte por **WhatsApp** para confirmar tu pedido antes del despacho.',
    '',
    '## 5. Medios de pago',
    'Aceptamos dos formas de pago:',
    '- **Pago contra entrega:** pagas al recibir tu pedido (disponible en las zonas con cobertura).',
    '- **Pago en línea:** a través de la pasarela segura **Wompi**. Mundo Smart no almacena ni tiene acceso a los datos de tu tarjeta.',
    '',
    '## 6. Envíos',
    'Realizamos envíos a todo el territorio nacional. El tiempo estimado de entrega es de **2 a 5 días hábiles** según la ciudad. El costo de envío es de **$12.000 COP**, y es **gratis** en compras desde **$150.000 COP**. Los tiempos pueden variar por factores de la transportadora o de fuerza mayor.',
    '',
    '## 7. Garantía y devoluciones',
    'Todos nuestros productos cuentan con **garantía de 30 días por defectos de fábrica**. Si tu producto llega dañado o con fallas, lo cambiamos sin costo.',
    'Conforme al Estatuto del Consumidor (Ley 1480 de 2011), si realizaste tu compra en línea tienes **derecho de retracto dentro de los 5 días hábiles** siguientes a la entrega, siempre que el producto no haya sido usado y esté en sus condiciones originales. Para hacer efectiva la garantía o una devolución, escríbenos por WhatsApp con tu número de pedido.',
    '',
    '## 8. Propiedad intelectual',
    'El nombre, el logotipo, los textos y el diseño de Mundo Smart son de nuestra propiedad y están protegidos. Las marcas, logotipos y nombres de terceros que puedan aparecer pertenecen a sus respectivos dueños y se mencionan únicamente con fines de referencia o compatibilidad.',
    '',
    '## 9. Limitación de responsabilidad',
    'Mundo Smart no se hace responsable por daños derivados del uso indebido de los productos o del sitio, ni por retrasos ocasionados por terceros ajenos a nuestro control.',
    '',
    '## 10. Cambios en los términos',
    'Podemos actualizar estos Términos y Condiciones en cualquier momento. La versión vigente será siempre la publicada en esta página, con su fecha de actualización.',
    '',
    '## 11. Ley aplicable y contacto',
    'Estos términos se rigen por las leyes de la República de Colombia. Para cualquier duda, reclamo o solicitud puedes contactarnos por WhatsApp al [+57 311 235 0585](https://wa.me/573112350585).',
  ].join('\n');

  var privacidad = [
    'En **Mundo Smart** protegemos tu información. Esta política explica qué datos recolectamos, con qué fin y cómo puedes ejercer tus derechos, conforme a la **Ley 1581 de 2012** y el Decreto 1377 de 2013 de Colombia (Habeas Data).',
    '',
    '## 1. Responsable del tratamiento',
    'El responsable del tratamiento de tus datos es **Mundo Smart**. Puedes contactarnos por WhatsApp al [+57 311 235 0585](https://wa.me/573112350585) para cualquier asunto relacionado con tus datos personales.',
    '',
    '## 2. Datos que recolectamos',
    'Recolectamos únicamente los datos necesarios para procesar y entregar tus pedidos:',
    '- Nombre completo.',
    '- Número de teléfono / WhatsApp.',
    '- Dirección de entrega y ciudad.',
    '- Correo electrónico (si lo proporcionas).',
    '',
    '## 3. Finalidad del tratamiento',
    'Usamos tus datos para procesar y entregar tus pedidos, contactarte para confirmar la compra o resolver dudas, brindar soporte, gestionar garantías o devoluciones e informarte del estado de tu envío. No vendemos ni compartimos tus datos con fines publicitarios.',
    '',
    '## 4. Pagos',
    'Los pagos en línea se procesan a través de la pasarela segura **Wompi**. Mundo Smart **no almacena ni tiene acceso** a los datos de tu tarjeta.',
    '',
    '## 5. Transferencia a terceros',
    'Para cumplir con el envío, compartimos los datos estrictamente necesarios (nombre, dirección y teléfono) con la transportadora y el proveedor que despacha tu pedido, solo para completar la entrega.',
    '',
    '## 6. Tus derechos como titular',
    'De acuerdo con la ley, tienes derecho a:',
    '- **Conocer** los datos que tenemos sobre ti.',
    '- **Actualizar y rectificar** tus datos cuando sean inexactos o estén desactualizados.',
    '- **Solicitar la supresión** de tus datos cuando lo consideres pertinente.',
    '- **Revocar** la autorización para su tratamiento.',
    'Para ejercer estos derechos, escríbenos por WhatsApp al [+57 311 235 0585](https://wa.me/573112350585).',
    '',
    '## 7. Conservación y seguridad',
    'Conservamos tus datos solo durante el tiempo necesario para cumplir con las finalidades descritas y las obligaciones legales. Aplicamos medidas razonables para proteger tu información.',
    '',
    '## 8. Cookies y almacenamiento local',
    'Este sitio usa almacenamiento local del navegador (localStorage) únicamente para recordar los productos de tu carrito mientras navegas. No lo usamos para rastrearte ni para publicidad.',
    '',
    '## 9. Cambios en esta política',
    'Podemos actualizar esta Política de Privacidad en cualquier momento. La versión vigente será siempre la publicada en esta página.',
  ].join('\n');

  window.LEGAL = { render: render, defaults: { terminos: terminos, privacidad: privacidad } };
})();
