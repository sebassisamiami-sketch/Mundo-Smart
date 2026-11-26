(function () {
  'use strict';

  var CFG = window.CONFIG;
  var PRODUCTS = window.PRODUCTS;
  var CATS = window.CATEGORIES;
  var ICONS = window.ICONS;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: CFG.currency, maximumFractionDigits: 0 });
  var fmt = function (n) { return money.format(n); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = matchMedia('(hover: hover)').matches;

  var DEPTS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

  /* ---------- Utilidades ---------- */
  function svg(name) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' + (ICONS[name] || ICONS.case) + '</svg>';
  }
  function media(p) {
    return p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" />' : svg(p.icon);
  }
  // Lista de fotos de un producto (varias si tiene galería, o una, o ninguna)
  function gallery(p) {
    if (p.imgs && p.imgs.length) return p.imgs;
    return p.img ? [p.img] : [];
  }
  // Carrusel de fotos para el modal
  function carousel(p) {
    var imgs = gallery(p);
    if (imgs.length === 0) return '<div class="car-single">' + svg(p.icon) + '</div>';
    if (imgs.length === 1) return '<div class="car-single"><img src="' + esc(imgs[0]) + '" alt="' + esc(p.name) + '" /></div>';
    var slides = imgs.map(function (u, i) {
      return '<div class="car-slide"><img src="' + esc(u) + '" alt="' + esc(p.name) + ' foto ' + (i + 1) + '" loading="lazy" /></div>';
    }).join('');
    var dots = imgs.map(function (_, i) {
      return '<button class="car-dot' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-label="Foto ' + (i + 1) + '"></button>';
    }).join('');
    return '<div class="carousel" data-n="' + imgs.length + '">' +
      '<div class="car-track">' + slides + '</div>' +
      '<button class="car-nav car-prev" aria-label="Anterior">‹</button>' +
      '<button class="car-nav car-next" aria-label="Siguiente">›</button>' +
      '<span class="car-count">1/' + imgs.length + '</span>' +
      '<div class="car-dots">' + dots + '</div></div>';
  }
  function initCarousel(root) {
    var car = root.querySelector('.carousel');
    if (!car) return;
    var track = car.querySelector('.car-track');
    var dots = Array.prototype.slice.call(car.querySelectorAll('.car-dot'));
    var count = car.querySelector('.car-count');
    var n = Number(car.getAttribute('data-n'));
    function cur() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    }
    function sync() {
      var i = cur();
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
      if (count) count.textContent = (i + 1) + '/' + n;
    }
    car.querySelector('.car-prev').addEventListener('click', function () { go(cur() - 1); });
    car.querySelector('.car-next').addEventListener('click', function () { go(cur() + 1); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.dataset.i)); }); });
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  }
  function catName(id) {
    var c = CATS.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : '';
  }
  function findP(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 2400);
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---------- Estado ---------- */
  var cart = store('ms_cart') || [];
  var state = { cat: 'all', q: '', sort: 'rel' };

  /* ---------- Nav, progreso y menú móvil ---------- */
  var nav = $('#nav');
  var bar = $('#progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('scrolled', y > 24);
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burger');
  var links = $('#navLinks');
  function menu(open) {
    burger.setAttribute('aria-expanded', open);
    links.classList.toggle('on', open);
    document.body.classList.toggle('lock', open);
  }
  burger.addEventListener('click', function () { menu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  /* ---------- Reveal al hacer scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  function observe(root) {
    $$('[data-reveal]:not(.in)', root).forEach(function (el) {
      if (io && !reduce) io.observe(el); else el.classList.add('in');
    });
  }
  observe(document);

  /* ---------- Categorías ---------- */
  var catGrid = $('#catGrid');
  catGrid.innerHTML = CATS.map(function (c, i) {
    return '<button class="cat" data-cat="' + c.id + '" data-reveal style="--d:' + (i * 0.07).toFixed(2) + 's">' +
      '<svg class="arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg>' +
      svg(c.icon) +
      '<div><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p></div></button>';
  }).join('');
  catGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.cat');
    if (!b) return;
    setCat(b.dataset.cat);
    $('#productos').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  if (canHover) {
    catGrid.addEventListener('pointermove', function (e) {
      var b = e.target.closest('.cat');
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- Filtros y grilla ---------- */
  var chips = $('#chips');
  function renderChips() {
    var all = [{ id: 'all', name: 'Todos' }].concat(CATS);
    chips.innerHTML = all.map(function (c) {
      return '<button class="chip' + (state.cat === c.id ? ' on' : '') + '" role="tab" aria-selected="' + (state.cat === c.id) + '" data-cat="' + c.id + '">' + esc(c.name) + '</button>';
    }).join('');
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (b) setCat(b.dataset.cat);
  });
  function setCat(id) { state.cat = id; renderChips(); renderGrid(); }

  $('#search').addEventListener('input', function (e) { state.q = e.target.value.trim().toLowerCase(); renderGrid(); });
  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(); });

  var grid = $('#grid');
  function renderGrid() {
    var list = PRODUCTS.filter(function (p) {
      var okC = state.cat === 'all' || p.cat === state.cat;
      var okQ = !state.q || (p.name + ' ' + p.short + ' ' + catName(p.cat)).toLowerCase().indexOf(state.q) > -1;
      return okC && okQ;
    });
    if (state.sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });

    grid.innerHTML = list.map(function (p, i) {
      var off = p.was && p.was > p.price ? Math.round((1 - p.price / p.was) * 100) : 0;
      return '<article class="card pop" data-id="' + p.id + '" style="--d:' + (Math.min(i, 8) * 0.05).toFixed(2) + 's" tabindex="0" aria-label="' + esc(p.name) + '">' +
        '<div class="thumb">' + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + (off ? '<span class="badge off">-' + off + '%</span>' : '') + (gallery(p).length > 1 ? '<span class="photo-count">▣ ' + gallery(p).length + '</span>' : '') + media(p) + '</div>' +
        '<div class="c-body"><span class="c-cat">' + esc(catName(p.cat)) + '</span>' +
        '<h3 class="c-name">' + esc(p.name) + '</h3>' +
        '<p class="c-short">' + esc(p.short) + '</p>' +
        '<div class="c-foot"><span class="price">' + fmt(p.price) + (off ? '<s>' + fmt(p.was) + '</s>' : '') + '</span>' +
        '<button class="add" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.name) + ' al carrito">+</button></div></div></article>';
    }).join('');
    $('#empty').hidden = list.length > 0;
  }

  grid.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addToCart(add.dataset.add, 1); return; }
    var card = e.target.closest('.card');
    if (card) openModal(card.dataset.id);
  });
  grid.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.classList.contains('card')) openModal(e.target.dataset.id);
  });

  // Inclinación 3D sutil de las tarjetas (solo con mouse)
  if (canHover && !reduce) {
    grid.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
      c.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
    grid.addEventListener('pointerleave', function () {
      $$('.card', grid).forEach(function (c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
    grid.addEventListener('pointerout', function (e) {
      var c = e.target.closest('.card');
      if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
    });
  }

  /* ---------- Overlay / modal / drawer ---------- */
  var overlay = $('#overlay');
  var modal = $('#modal');
  var drawer = $('#drawer');
  var modalQty = 1;
  var modalId = null;

  function showOverlay() {
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('on'); });
    document.body.classList.add('lock');
  }
  function hideOverlay() {
    overlay.classList.remove('on');
    document.body.classList.remove('lock');
    setTimeout(function () { if (!overlay.classList.contains('on')) overlay.hidden = true; }, 400);
  }

  function openModal(id) {
    var p = findP(id);
    if (!p) return;
    modalId = id; modalQty = 1;
    var off = p.was && p.was > p.price;
    $('#mMedia').innerHTML = carousel(p);
    initCarousel($('#mMedia'));
    $('#mCat').textContent = catName(p.cat);
    $('#mTitle').textContent = p.name;
    $('#mPrice').innerHTML = fmt(p.price) + (off ? '<s>' + fmt(p.was) + '</s>' : '');
    $('#mShort').textContent = p.short;
    $('#mFeats').innerHTML = (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
    $('#mQtyVal').textContent = '1';
    showOverlay();
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('on'); });
  }
  function closeModal() {
    modal.classList.remove('on');
    setTimeout(function () { modal.hidden = true; }, 350);
    if (!drawer.classList.contains('on')) hideOverlay();
  }
  $('#modalClose').addEventListener('click', closeModal);
  $('#mQty').addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]');
    if (!b) return;
    modalQty = Math.max(1, Math.min(10, modalQty + Number(b.dataset.q)));
    $('#mQtyVal').textContent = modalQty;
  });
  $('#mAdd').addEventListener('click', function () {
    addToCart(modalId, modalQty);
    closeModal();
    setTimeout(openDrawer, 250);
  });

  function openDrawer() {
    view('cart');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('on');
    showOverlay();
  }
  function closeDrawer() {
    drawer.classList.remove('on');
    drawer.setAttribute('aria-hidden', 'true');
    hideOverlay();
  }
  $('#cartOpen').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#doneClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', function () { if (!modal.hidden) closeModal(); closeDrawer(); });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!modal.hidden) closeModal(); closeDrawer(); menu(false); }
  });

  /* ---------- Carrito ---------- */
  function persist() { store('ms_cart', cart); }
  function addToCart(id, qty) {
    var p = findP(id);
    if (!p) return;
    var line = cart.filter(function (l) { return l.id === id; })[0];
    if (line) line.qty = Math.min(10, line.qty + qty); else cart.push({ id: id, qty: qty });
    persist(); renderCart();
    var c = $('#cartCount');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    toast('Agregado: ' + p.name);
  }
  function subtotal() {
    return cart.reduce(function (s, l) { var p = findP(l.id); return s + (p ? p.price * l.qty : 0); }, 0);
  }
  function shipping(sub) {
    if (!sub) return 0;
    return sub >= CFG.freeShippingFrom ? 0 : CFG.shippingFlat;
  }
  function countryCO() { return $('#fCountry').value === 'CO'; }

  function renderCart() {
    cart = cart.filter(function (l) { return findP(l.id); });
    var count = cart.reduce(function (n, l) { return n + l.qty; }, 0);
    var cc = $('#cartCount');
    cc.textContent = count;
    cc.classList.toggle('on', count > 0);

    var items = $('#items');
    if (!cart.length) {
      items.innerHTML = '<div class="empty-cart">Tu carrito está vacío.<br />Explora el catálogo y agrega tus favoritos.</div>';
      $('#cartFoot').hidden = true;
      return;
    }
    $('#cartFoot').hidden = false;
    items.innerHTML = cart.map(function (l) {
      var p = findP(l.id);
      return '<div class="item" data-id="' + p.id + '"><div class="t">' + media(p) + '</div>' +
        '<div><div class="n">' + esc(p.name) + '</div><div class="p">' + fmt(p.price) + '</div>' +
        '<div class="qty"><button type="button" data-d="-1" aria-label="Menos">−</button><span>' + l.qty + '</span><button type="button" data-d="1" aria-label="Más">+</button></div></div>' +
        '<button class="rm" data-rm="' + p.id + '">Quitar</button></div>';
    }).join('');

    var sub = subtotal();
    var ship = shipping(sub);
    $('#subtotal').textContent = fmt(sub);
    $('#shipping').textContent = ship ? fmt(ship) : 'Gratis';
    $('#total').textContent = fmt(sub + ship);
    $('#total2').textContent = fmt(sub + ship);
    var left = CFG.freeShippingFrom - sub;
    $('#shipFill').style.width = Math.min(100, (sub / CFG.freeShippingFrom) * 100) + '%';
    $('#shipNote').textContent = left > 0 ? 'Te faltan ' + fmt(left) + ' para envío gratis.' : '¡Tienes envío gratis!';
  }
  $('#items').addEventListener('click', function (e) {
    var item = e.target.closest('.item');
    if (!item) return;
    var line = cart.filter(function (l) { return l.id === item.dataset.id; })[0];
    var d = e.target.closest('[data-d]');
    if (d && line) { line.qty = Math.max(1, Math.min(10, line.qty + Number(d.dataset.d))); }
    if (e.target.closest('[data-rm]')) cart = cart.filter(function (l) { return l.id !== item.dataset.id; });
    persist(); renderCart();
  });

  /* ---------- Checkout ---------- */
  var views = { cart: $('#viewCart'), checkout: $('#viewCheckout'), done: $('#viewDone') };
  function view(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    $('#dTitle').textContent = name === 'checkout' ? 'Tus datos' : name === 'done' ? 'Listo' : 'Tu carrito';
  }
  $('#toCheckout').addEventListener('click', function () { if (cart.length) { view('checkout'); updateCountry(); } });
  $('#backCart').addEventListener('click', function () { view('cart'); });

  $('#fDept').innerHTML = '<option value="">Selecciona…</option>' + DEPTS.map(function (d) { return '<option>' + d + '</option>'; }).join('');
  function updateCountry() {
    var co = countryCO();
    $('#lblDept').hidden = !co;
    $('#countryHint').textContent = co
      ? 'Entrega estimada: ' + CFG.deliveryCO + '. Pago contra entrega disponible.'
      : 'Entrega estimada: ' + CFG.deliveryIntl + '. Te confirmamos el costo de envío y el método de pago por WhatsApp.';
    renderPayments();
  }
  $('#fCountry').addEventListener('change', updateCountry);

  /* ---------- Métodos de pago ---------- */
  var PAY = CFG.payments || {};
  function payMethodList() {
    var list = [];
    if (PAY.contraentrega !== false) list.push({ id: 'contraentrega', label: 'Pago contra entrega', desc: 'Pagas en efectivo al recibir tu pedido' });
    if (PAY.epayco && PAY.epayco.enabled) list.push({ id: 'epayco', label: 'Tarjeta / PSE · ePayco', desc: 'Pago en línea seguro' });
    if (PAY.wompi && PAY.wompi.enabled) list.push({ id: 'wompi', label: 'Tarjeta / PSE · Wompi', desc: 'Pago en línea seguro' });
    if (PAY.mercadopago && PAY.mercadopago.enabled) list.push({ id: 'mercadopago', label: 'Mercado Pago', desc: 'Pago en línea seguro' });
    return list;
  }
  function renderPayments() {
    var box = $('#payMethods');
    if (!countryCO()) { box.hidden = true; return; }
    var methods = payMethodList();
    box.hidden = false;
    $('#payOpts').innerHTML = methods.map(function (m, i) {
      return '<label class="pay-opt"><input type="radio" name="paym" value="' + m.id + '"' + (i === 0 ? ' checked' : '') + ' />' +
        '<span class="pay-dot"></span><span class="pay-txt"><b>' + esc(m.label) + '</b><small>' + esc(m.desc) + '</small></span></label>';
    }).join('');
  }
  function selectedPayment() {
    if (!countryCO()) return 'por-confirmar';
    var r = form.querySelector('input[name="paym"]:checked');
    return r ? r.value : 'contraentrega';
  }

  var form = $('#viewCheckout');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#formErr');
    err.hidden = true;
    $$('.invalid', form).forEach(function (n) { n.classList.remove('invalid'); });

    var f = form.elements;
    var co = countryCO();
    var bad = [];
    if (f.name.value.trim().length < 3) bad.push(f.name);
    var digits = f.phone.value.replace(/\D/g, '');
    if (co ? !/^3\d{9}$/.test(digits) : digits.length < 7) bad.push(f.phone);
    if (co && !f.dept.value) bad.push(f.dept);
    if (f.city.value.trim().length < 2) bad.push(f.city);
    if (f.address.value.trim().length < 6) bad.push(f.address);
    if (bad.length) {
      bad.forEach(function (n) { n.classList.add('invalid'); });
      err.textContent = 'Revisa los campos marcados' + (bad.indexOf(f.phone) > -1 && co ? ' (celular de 10 dígitos que empiece por 3).' : '.');
      err.hidden = false;
      bad[0].focus();
      return;
    }

    var sub = subtotal();
    var ship = shipping(sub);
    var method = selectedPayment();
    var order = {
      ref: 'MS-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      country: co ? 'CO' : 'OTHER',
      payment: method,
      customer: {
        name: f.name.value.trim(), phone: digits,
        department: co ? f.dept.value : '', city: f.city.value.trim(),
        address: f.address.value.trim(), notes: f.notes.value.trim(),
      },
      items: cart.map(function (l) {
        var p = findP(l.id);
        return { sku: p.id, dropiId: p.dropiId, name: p.name, qty: l.qty, price: p.price };
      }),
      subtotal: sub, shipping: ship, total: sub + ship, currency: CFG.currency,
    };
    if (method === 'contraentrega' || method === 'por-confirmar') submit(order);
    else payOnline(order);
  });

  /* ---------- Pasarelas de pago en línea ---------- */
  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) return cb();
    var s = document.createElement('script');
    s.src = src; s.onload = function () { cb(); }; s.onerror = function () { cb('error'); };
    document.head.appendChild(s);
  }
  // Deja el registro del pedido para el vendedor (con la dirección), aparte del cobro
  function recordOrder(order) {
    if (CFG.orderEndpoint) { try { fetch(CFG.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }); } catch (e) {} }
    else if (waConfigured()) { try { window.open(waLink(waText(order)), '_blank', 'noopener'); } catch (e) {} }
  }
  function payOnline(order) {
    if (order.payment === 'epayco') return payEpayco(order);
    if (order.payment === 'wompi') return payWompi(order);
    if (order.payment === 'mercadopago') return payMercadoPago(order);
  }
  function payEpayco(order) {
    var cfg = PAY.epayco || {};
    if (!cfg.publicKey) { toast('Falta tu llave pública de ePayco (js/config.js)'); return; }
    loadScript('https://checkout.epayco.co/checkout.js', function (err) {
      if (err || !window.ePayco) { toast('No se pudo cargar ePayco'); return; }
      var handler = window.ePayco.checkout.configure({ key: cfg.publicKey, test: !!cfg.test });
      handler.open({
        name: CFG.storeName, description: 'Pedido ' + order.ref, invoice: order.ref,
        currency: 'cop', amount: String(order.total), tax_base: '0', tax: '0', country: 'co', lang: 'es', external: 'false',
        name_billing: order.customer.name, mobilephone_billing: order.customer.phone, address_billing: order.customer.address,
        extra1: order.customer.city + ', ' + order.customer.department, extra2: order.customer.address, extra3: order.customer.notes,
      });
      recordOrder(order);
      finish('Completa el pago en la ventana de ePayco. Te confirmaremos tu pedido.');
    });
  }
  function payWompi(order) {
    var cfg = PAY.wompi || {};
    // MODO EXACTO (con backend): si hay llave pública + Worker de firma, el monto
    // sale automático y exacto, sin que el cliente lo escriba. Tiene prioridad.
    if (cfg.publicKey && cfg.signatureEndpoint) {
      var cents = Math.round(order.total * 100);
      fetch(cfg.signatureEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: order.ref, amountInCents: cents, currency: 'COP' }) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.signature) { toast('No se pudo generar la firma de Wompi'); return; }
          loadScript('https://checkout.wompi.co/widget.js', function (err) {
            if (err || !window.WidgetCheckout) { toast('No se pudo cargar Wompi'); return; }
            var checkout = new window.WidgetCheckout({
              currency: 'COP', amountInCents: cents, reference: order.ref, publicKey: cfg.publicKey,
              signature: { integrity: d.signature },
              customerData: { fullName: order.customer.name, phoneNumber: order.customer.phone, phoneNumberPrefix: '+57' },
            });
            // Liberar el scroll para que el modal de Wompi se pueda desplazar completo
            document.body.classList.remove('lock');
            document.body.style.overflow = '';
            checkout.open(function () {
              finish('¡Gracias! Para despachar tu pedido, envíanos tu dirección por WhatsApp con el botón de abajo.', { title: 'Pago recibido', waOrder: order });
            });
          });
        })
        .catch(function () { toast('No se pudo iniciar Wompi'); });
      return;
    }
    // MODO FÁCIL (sin backend): link de pagos. El cliente escribe el total en Wompi.
    if (cfg.paymentLink) {
      window.open(cfg.paymentLink, '_blank', 'noopener');
      finish('Paga ' + fmt(order.total) + ' en la ventana de Wompi (tarjeta, Nequi o PSE). Después toca el botón de abajo para enviarnos tu dirección y despachar tu pedido.',
        { title: 'Casi listo — paga en Wompi', waOrder: order });
      return;
    }
    toast('Wompi necesita tu link de pagos, o tu llave pública y el Worker de la firma');
  }
  function payMercadoPago(order) {
    var cfg = PAY.mercadopago || {};
    if (!cfg.preferenceEndpoint) { toast('Mercado Pago necesita tu backend de preferencias'); return; }
    fetch(cfg.preferenceEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.init_point) { recordOrder(order); window.location.href = d.init_point; }
        else toast('No se pudo crear el pago en Mercado Pago');
      })
      .catch(function () { toast('No se pudo iniciar Mercado Pago'); });
  }

  function waText(o) {
    var lines = ['Hola, quiero hacer este pedido en ' + CFG.storeName + ':', ''];
    o.items.forEach(function (i) { lines.push('• ' + i.qty + ' x ' + i.name + ' — ' + fmt(i.price * i.qty)); });
    lines.push('', 'Subtotal: ' + fmt(o.subtotal), 'Envío: ' + (o.shipping ? fmt(o.shipping) : 'Gratis'), 'Total: ' + fmt(o.total), '');
    lines.push('Nombre: ' + o.customer.name, 'Celular: ' + o.customer.phone);
    lines.push('Ubicación: ' + [o.customer.city, o.customer.department, o.country === 'CO' ? 'Colombia' : 'Otro país'].filter(Boolean).join(', '));
    lines.push('Dirección: ' + o.customer.address);
    if (o.customer.notes) lines.push('Notas: ' + o.customer.notes);
    var payNames = { contraentrega: 'Contra entrega', epayco: 'Tarjeta/PSE (ePayco)', wompi: 'Tarjeta/PSE (Wompi)', mercadopago: 'Mercado Pago', 'por-confirmar': 'A confirmar' };
    lines.push('Pedido: ' + o.ref, 'Pago: ' + (payNames[o.payment] || 'A confirmar'));
    return lines.join('\n');
  }
  function waLink(text) {
    return 'https://wa.me/' + CFG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function finish(msg, opts) {
    opts = opts || {};
    cart = []; persist(); renderCart();
    form.reset(); updateCountry();
    $('#doneTitle').textContent = opts.title || '¡Pedido recibido!';
    $('#doneMsg').textContent = msg;
    var waBtn = $('#doneWa');
    if (opts.waOrder && waConfigured()) {
      waBtn.href = waLink(waText(opts.waOrder));
      waBtn.hidden = false;
    } else {
      waBtn.hidden = true;
    }
    view('done');
  }
  function waConfigured() { return /^\d{10,15}$/.test(CFG.whatsapp); }

  function submit(order) {
    var btn = $('#submitOrder');
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Enviando…';
    var restore = function () { btn.disabled = false; btn.textContent = label; };

    if (CFG.orderEndpoint) {
      fetch(CFG.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json().catch(function () { return {}; }); })
        .then(function () {
          restore();
          finish('Recibimos tu pedido. Te contactaremos por WhatsApp para confirmarlo.');
        })
        .catch(function () {
          restore();
          $('#formErr').textContent = 'No pudimos enviar el pedido. Inténtalo de nuevo o escríbenos por WhatsApp.';
          $('#formErr').hidden = false;
        });
      return;
    }

    // Sin backend: el pedido se arma como mensaje de WhatsApp
    restore();
    if (!waConfigured()) {
      $('#formErr').textContent = 'Falta configurar el número de WhatsApp de la tienda (js/config.js).';
      $('#formErr').hidden = false;
      return;
    }
    window.open(waLink(waText(order)), '_blank', 'noopener');
    finish('Se abrió WhatsApp con tu pedido. Envía el mensaje para que lo confirmemos.');
  }

  /* ---------- Varios ---------- */
  var wa = $('#waCta');
  wa.href = waConfigured() ? waLink('Hola, tengo una pregunta sobre ' + CFG.storeName) : '#';
  wa.addEventListener('click', function (e) { if (!waConfigured()) { e.preventDefault(); toast('Configura tu WhatsApp en js/config.js'); } });
  $('#faqCO').textContent = 'En Colombia, ' + CFG.deliveryCO + ' según la ciudad.';
  $('#faqIntl').textContent = 'Sí, bajo pedido. Tiempo estimado: ' + CFG.deliveryIntl + '. Te confirmamos el costo antes de cobrar; pueden aplicar impuestos de aduana del país de destino.';
  $('#year').textContent = new Date().getFullYear();

  renderChips();
  renderGrid();
  renderCart();
  updateCountry();
  observe(document);
})();
