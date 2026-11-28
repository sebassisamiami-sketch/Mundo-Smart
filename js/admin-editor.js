/*
 * admin-editor.js — Editor EN VIVO de la tienda, dentro del panel.
 *
 * Deja al administrador editar productos, fotos, categorías, ajustes y textos
 * legales. Todo se guarda en Firestore (colección "site") y la tienda lo toma
 * al instante (ver js/content.js), sin volver a publicar la página.
 *
 * Fotos: se suben a Firebase Storage (carpeta /products). Requiere Storage activo.
 *
 * Expone window.MSEditor.render(container). admin.js lo llama al abrir la pestaña.
 */
(function () {
  'use strict';
  var fb = window.firebase;
  var db = null, storage = null;

  function initFb() {
    if (!db) { try { db = fb.firestore(); } catch (e) {} }
    if (!storage) { try { if (fb.storage) storage = fb.storage(); } catch (e) {} }
  }

  var S = {
    loaded: false,
    sub: 'productos',
    prodFilter: 'all',
    cat: { products: [], categories: [] }, catExists: false,
    conf: {}, confExists: false,
    legal: { terminos: '', privacidad: '' }, legalExists: false,
    dirty: { catalog: false, config: false, legal: false },
    openId: null,
    flashId: null,
  };
  var root = null;

  /* ---------- utilidades ---------- */
  function clone(x) { try { return JSON.parse(JSON.stringify(x)); } catch (e) { return x; } }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function toNum(v) { return Number(String(v == null ? '' : v).replace(/[^\d.-]/g, '')) || 0; }
  function money(n) { return '$' + (Number(n) || 0).toLocaleString('es-CO'); }
  function genId(prefix) { return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }
  function iconKeys() { return Object.keys(window.ICONS || {}); }
  function catName(id) { var c = S.cat.categories.filter(function (x) { return x.id === id; })[0]; return c ? c.name : '—'; }
  function imgsOf(p) { if (p.imgs && p.imgs.length) return p.imgs; return p.img ? [p.img] : []; }
  function isVideo(u) { return /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(String(u || '')); }

  /* ---------- Íconos de línea (estilo Instagram) ---------- */
  var ICN = {
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    up: '<path d="M18 15l-6-6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    video: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    grip: '<circle cx="9" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="19" r="1.4"/>',
  };
  function icon(name) {
    var p = ICN[name] || '';
    var attrs = name === 'grip' ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg class="eic" viewBox="0 0 24 24" ' + attrs + ' aria-hidden="true">' + p + '</svg>';
  }
  function edThumb(u) {
    if (!u) return '<span class="ph">' + icon('image') + '</span>';
    return isVideo(u) ? '<video src="' + esc(u) + '#t=0.5" muted preload="metadata"></video>' : '<img src="' + esc(u) + '" alt="">';
  }

  var toastEl = null, toastT = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ed-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function setDirty(kind) {
    S.dirty[kind] = true;
    var dot = root && root.querySelector('[data-dirty="' + kind + '"]');
    if (dot) dot.textContent = '● Cambios sin guardar';
  }

  /* ---------- carga ---------- */
  function load() {
    initFb();
    if (!db) { root.innerHTML = '<div class="section"><div class="empty">No se pudo conectar con Firebase.</div></div>'; return; }
    root.innerHTML = '<div class="loading"><div class="spin"></div>Cargando el editor…</div>';
    Promise.all([
      db.collection('site').doc('catalog').get(),
      db.collection('site').doc('config').get(),
      db.collection('site').doc('legal').get(),
    ]).then(function (res) {
      var cat = res[0], conf = res[1], legal = res[2];
      if (cat.exists && Array.isArray((cat.data() || {}).products)) {
        var d = cat.data();
        S.cat = { products: d.products || [], categories: d.categories || clone(window.CATEGORIES || []) };
        S.catExists = true;
      } else {
        S.cat = { products: clone(window.PRODUCTS || []), categories: clone(window.CATEGORIES || []) };
        S.catExists = false;
      }
      if (conf.exists) { S.conf = conf.data() || {}; S.confExists = true; }
      else { S.conf = pickConf(window.CONFIG || {}); S.confExists = false; }
      if (legal.exists) { var l = legal.data() || {}; S.legal = { terminos: l.terminos || '', privacidad: l.privacidad || '' }; S.legalExists = true; }
      S.loaded = true;
      draw();
    }).catch(function (e) {
      root.innerHTML = '<div class="section"><div class="empty">⚠️ No se pudo cargar el contenido. ' +
        esc((e && e.code === 'permission-denied') ? 'Publica las reglas de Firestore actualizadas (backend/firestore.rules).' : (e && e.message || '')) + '</div></div>';
    });
  }
  function pickConf(c) {
    return {
      storeName: c.storeName || 'Mundo Smart',
      whatsapp: c.whatsapp || '',
      currency: c.currency || 'COP',
      warranty: c.warranty || '',
      shippingFlat: c.shippingFlat || 0,
      freeShippingFrom: c.freeShippingFrom || 0,
      deliveryCO: c.deliveryCO || '',
      deliveryIntl: c.deliveryIntl || '',
    };
  }

  /* ---------- dibujo principal ---------- */
  function draw() {
    if (!S.loaded) return load();
    var subs = [['productos', 'box', 'Productos'], ['categorias', 'tag', 'Categorías'], ['ajustes', 'sliders', 'Ajustes'], ['legal', 'file', 'Textos y políticas']];
    var tabs = subs.map(function (s) {
      return '<button class="ed-subtab' + (S.sub === s[0] ? ' on' : '') + '" data-sub="' + s[0] + '">' + icon(s[1]) + '<span>' + s[2] + '</span></button>';
    }).join('');
    var body = S.sub === 'productos' ? viewProductos()
      : S.sub === 'categorias' ? viewCategorias()
      : S.sub === 'ajustes' ? viewAjustes()
      : viewLegal();
    root.innerHTML = '<div class="ed">' +
      '<div class="ed-intro">Edita tu tienda aquí. Los cambios se publican al tocar <b>Guardar</b> y se ven en la tienda al instante.</div>' +
      '<div class="ed-subtabs">' + tabs + '</div>' +
      '<div class="ed-body' + (S._lastSub !== S.sub ? ' fade' : '') + '">' + body + '</div></div>';
    S._lastSub = S.sub;
    if (S.flashId) { setTimeout(function () { S.flashId = null; }, 80); }
  }

  /* ================= PRODUCTOS ================= */
  function viewProductos() {
    var hint = S.catExists ? '' : '<div class="ed-note">Estás viendo tu catálogo actual. Toca <b>Guardar y publicar</b> una vez para empezar a editarlo en vivo.</div>';
    var filter = S.prodFilter || 'all';
    var list = filter === 'all' ? S.cat.products : S.cat.products.filter(function (p) { return p.cat === filter; });
    var opts = '<option value="all"' + (filter === 'all' ? ' selected' : '') + '>Todas las categorías</option>' +
      S.cat.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === filter ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('');
    var rows = list.map(function (p, i) { return productRow(p, i); }).join('');
    if (!list.length) rows = '<div class="empty">' + (filter === 'all' ? 'No hay productos. Agrega el primero.' : 'No hay productos en esta categoría.') + '</div>';
    return hint +
      '<div class="ed-bar">' +
        '<button class="btn btn-accent" data-act="prod-add">' + icon('plus') + 'Nuevo producto</button>' +
        '<label class="ed-filter">Ver: <select data-prodfilter>' + opts + '</select></label>' +
        '<span class="ed-count">' + list.length + (filter === 'all' ? ' productos' : ' en esta categoría') + '</span>' +
        '<span class="spacer"></span>' +
        '<span class="ed-dirty" data-dirty="catalog">' + (S.dirty.catalog ? '● Cambios sin guardar' : '') + '</span>' +
        '<button class="btn btn-accent" data-act="catalog-save">' + icon('check') + 'Guardar y publicar</button>' +
      '</div>' +
      (filter !== 'all' ? '<div class="ed-note">Viendo solo <b>' + esc(catName(filter)) + '</b>. Aquí ordenas los productos <b>dentro de esta categoría</b> con las flechas o arrastrando la manija.</div>' : '') +
      '<div class="ed-list">' + rows + '</div>';
  }

  function productRow(p, i) {
    var open = S.openId === p.id;
    var flash = S.flashId === p.id ? ' flash' : '';
    var head = '<div class="ed-row-h">' +
        '<span class="ic drag" draggable="true" data-draghandle data-dragkind="prod" data-id="' + esc(p.id) + '" title="Arrastrar para mover">' + icon('grip') + '</span>' +
        '<div class="ed-thumb">' + edThumb(imgsOf(p)[0]) + '</div>' +
        '<div class="ed-row-main"><b>' + esc(p.name || '(sin nombre)') + '</b>' +
          '<span class="ed-row-sub">' + esc(catName(p.cat)) + ' · ' + money(p.price) + (p.badge ? ' · ' + esc(p.badge) : '') + '</span></div>' +
        '<div class="ed-row-actions">' +
          '<button class="ic" data-act="prod-up" data-id="' + esc(p.id) + '" title="Subir">' + icon('up') + '</button>' +
          '<button class="ic" data-act="prod-down" data-id="' + esc(p.id) + '" title="Bajar">' + icon('down') + '</button>' +
          '<button class="ic" data-act="prod-toggle" data-id="' + esc(p.id) + '">' + (open ? icon('x') + 'Cerrar' : icon('edit') + 'Editar') + '</button>' +
          '<button class="ic ic-danger" data-act="prod-del" data-id="' + esc(p.id) + '" title="Eliminar">' + icon('trash') + '</button>' +
        '</div></div>';
    if (!open) return '<div class="ed-row' + flash + '" data-pid="' + esc(p.id) + '">' + head + '</div>';
    return '<div class="ed-row open' + flash + '" data-pid="' + esc(p.id) + '">' + head + productForm(p) + '</div>';
  }

  function field(label, id, fieldName, val, type, ph) {
    return '<label class="ed-f"><span>' + label + '</span>' +
      '<input type="' + (type || 'text') + '" data-field="' + fieldName + '" data-id="' + esc(id) + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '"></label>';
  }
  function productForm(p) {
    var cats = S.cat.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === p.cat ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('');
    var icons = [''].concat(iconKeys()).map(function (k) {
      return '<option value="' + esc(k) + '"' + (k === (p.icon || '') ? ' selected' : '') + '>' + (k || '(sin ícono)') + '</option>';
    }).join('');
    return '<div class="ed-form">' +
      '<div class="ed-grid">' +
        field('Nombre', p.id, 'name', p.name, 'text', 'Nombre del producto') +
        '<label class="ed-f"><span>Categoría</span><select data-field="cat" data-id="' + esc(p.id) + '">' + cats + '</select></label>' +
        field('Precio (COP)', p.id, 'price', p.price, 'text', '59900') +
        field('Precio tachado (opcional)', p.id, 'was', p.was, 'text', '0 = sin descuento') +
        field('Etiqueta (badge)', p.id, 'badge', p.badge, 'text', 'Top, Nuevo…') +
        field('Código Dropi', p.id, 'dropiId', p.dropiId, 'text', '') +
        field('Proveedor', p.id, 'provider', p.provider, 'text', '') +
        '<label class="ed-f"><span>Ícono (si no hay foto)</span><select data-field="icon" data-id="' + esc(p.id) + '">' + icons + '</select></label>' +
      '</div>' +
      '<label class="ed-f"><span>Descripción corta (tarjeta)</span><textarea data-field="short" data-id="' + esc(p.id) + '" rows="2" placeholder="Una línea que describe el producto">' + esc(p.short) + '</textarea></label>' +
      '<label class="ed-f"><span>Descripción completa</span><textarea data-field="description" data-id="' + esc(p.id) + '" rows="4" placeholder="Texto que se ve en «Ver información completa»">' + esc(p.description) + '</textarea></label>' +
      '<label class="ed-f"><span>Características (una por línea)</span><textarea data-field="features" data-id="' + esc(p.id) + '" rows="4" placeholder="Capacidad 10.000 mAh\nCarga inalámbrica">' + esc((p.features || []).join('\n')) + '</textarea></label>' +
      '<label class="ed-f"><span>Especificaciones (una por línea, «clave: valor»)</span><textarea data-field="specs" data-id="' + esc(p.id) + '" rows="4" placeholder="Capacidad: 10.000 mAh\nPuerto: USB-C">' + esc((p.specs || []).join('\n')) + '</textarea></label>' +
      imagesBlock(p) +
      '</div>';
  }

  function imagesBlock(p) {
    var imgs = imgsOf(p);
    var thumbs = imgs.map(function (u, i) {
      var vid = isVideo(u);
      return '<div class="ed-img">' +
        (i === 0 ? '<span class="ed-main">' + icon('star') + 'Principal</span>' : '') +
        (vid ? '<span class="ed-vidtag">' + icon('video') + '</span>' : '') +
        (vid ? '<video src="' + esc(u) + '#t=0.5" muted preload="metadata"></video>' : '<img src="' + esc(u) + '" alt="">') +
        '<div class="ed-img-acts">' +
          (i > 0 ? '<button class="ic" data-act="img-main" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Hacer principal">' + icon('star') + '</button>' : '') +
          '<button class="ic" data-act="img-up" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Mover izquierda">' + icon('left') + '</button>' +
          '<button class="ic" data-act="img-down" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Mover derecha">' + icon('right') + '</button>' +
          '<button class="ic ic-danger" data-act="img-del" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Quitar">' + icon('x') + '</button>' +
        '</div></div>';
    }).join('');
    if (!imgs.length) thumbs = '<div class="ed-img-empty">Sin fotos ni videos todavía.</div>';
    return '<div class="ed-images"><span class="ed-f-label">Fotos y videos <small>(la primera es la principal · usa las flechas o la estrella para ordenar)</small></span>' +
      '<div class="ed-img-grid">' + thumbs + '</div>' +
      '<div class="ed-img-add">' +
        '<label class="btn btn-sm">' + icon('camera') + 'Subir foto(s)<input type="file" accept="image/*" multiple data-act="img-upload" data-id="' + esc(p.id) + '" hidden></label>' +
        '<label class="btn btn-sm">' + icon('video') + 'Subir video<input type="file" accept="video/*" data-act="img-upload" data-id="' + esc(p.id) + '" hidden></label>' +
        '<input type="url" class="ed-url" data-id="' + esc(p.id) + '" placeholder="…o pega el enlace de una imagen/video (https://…)">' +
        '<button class="btn btn-sm" data-act="img-url" data-id="' + esc(p.id) + '">' + icon('link') + 'Enlace</button>' +
      '</div>' +
      '<div class="ed-up-status" data-up="' + esc(p.id) + '"></div></div>';
  }

  function findProd(id) { return S.cat.products.filter(function (p) { return p.id === id; })[0]; }
  function idxProd(id) { for (var i = 0; i < S.cat.products.length; i++) if (S.cat.products[i].id === id) return i; return -1; }

  /* ================= CATEGORÍAS ================= */
  function viewCategorias() {
    var rows = S.cat.categories.map(function (c, i) {
      var icons = [''].concat(iconKeys()).map(function (k) {
        return '<option value="' + esc(k) + '"' + (k === (c.icon || '') ? ' selected' : '') + '>' + (k || '(sin ícono)') + '</option>';
      }).join('');
      var used = S.cat.products.filter(function (p) { return p.cat === c.id; }).length;
      var photo = '<div class="ed-catimg">' + (c.img ? edThumb(c.img) : '<span class="ph">' + icon('image') + '</span>') +
        '<label class="btn btn-sm">' + icon('camera') + 'Subir<input type="file" accept="image/*" data-act="catimg-upload" data-cid="' + esc(c.id) + '" hidden></label>' +
        (c.img ? '<button class="ic ic-danger" data-act="catimg-del" data-cid="' + esc(c.id) + '" title="Quitar">' + icon('x') + '</button>' : '') +
        '</div>';
      var cflash = S.flashId === c.id ? ' flash' : '';
      return '<div class="ed-row open' + cflash + '" data-cidrow="' + esc(c.id) + '"><div class="ed-form">' +
        '<div class="ed-cat-head"><span class="ic drag" draggable="true" data-draghandle data-dragkind="cat" data-id="' + esc(c.id) + '" title="Arrastrar para mover">' + icon('grip') + '</span><b>' + esc(c.name || '(sin nombre)') + '</b><span class="ed-count">' + used + ' productos</span></div>' +
        '<div class="ed-grid">' +
          '<label class="ed-f"><span>Nombre</span><input data-cfield="name" data-cid="' + esc(c.id) + '" value="' + esc(c.name) + '"></label>' +
          '<label class="ed-f"><span>Descripción</span><input data-cfield="desc" data-cid="' + esc(c.id) + '" value="' + esc(c.desc) + '"></label>' +
          '<label class="ed-f"><span>Ícono (si no hay foto)</span><select data-cfield="icon" data-cid="' + esc(c.id) + '">' + icons + '</select></label>' +
          '<label class="ed-f"><span>Foto de la categoría (opcional)</span>' + photo + '</label>' +
        '</div>' +
        '<div class="ed-row-actions" style="justify-content:flex-start">' +
          '<button class="ic" data-act="cat-up" data-cid="' + esc(c.id) + '">' + icon('up') + 'Subir</button>' +
          '<button class="ic" data-act="cat-down" data-cid="' + esc(c.id) + '">' + icon('down') + 'Bajar</button>' +
          '<button class="ic ic-danger" data-act="cat-del" data-cid="' + esc(c.id) + '">' + icon('trash') + 'Eliminar</button>' +
        '</div></div></div>';
    }).join('');
    if (!S.cat.categories.length) rows = '<div class="empty">No hay categorías.</div>';
    return '<div class="ed-bar">' +
        '<button class="btn btn-accent" data-act="cat-add">' + icon('plus') + 'Nueva categoría</button>' +
        '<span class="spacer"></span>' +
        '<span class="ed-dirty" data-dirty="catalog">' + (S.dirty.catalog ? '● Cambios sin guardar' : '') + '</span>' +
        '<button class="btn btn-accent" data-act="catalog-save">' + icon('check') + 'Guardar y publicar</button>' +
      '</div><div class="ed-list">' + rows + '</div>';
  }

  /* ================= AJUSTES ================= */
  function viewAjustes() {
    var c = S.conf;
    function f(label, name, val, ph) {
      return '<label class="ed-f"><span>' + label + '</span><input data-conf="' + name + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '"></label>';
    }
    return '<div class="ed-bar">' +
        '<span class="ed-dirty" data-dirty="config">' + (S.dirty.config ? '● Cambios sin guardar' : '') + '</span>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn-accent" data-act="config-save">' + icon('check') + 'Guardar ajustes</button>' +
      '</div>' +
      '<div class="ed-form"><div class="ed-grid">' +
        f('Nombre de la tienda', 'storeName', c.storeName) +
        f('WhatsApp (con 57, sin +)', 'whatsapp', c.whatsapp, '573112350585') +
        f('Costo de envío (COP)', 'shippingFlat', c.shippingFlat, '12000') +
        f('Envío gratis desde (COP)', 'freeShippingFrom', c.freeShippingFrom, '150000') +
        f('Entrega en Colombia', 'deliveryCO', c.deliveryCO, '2 a 5 días hábiles') +
        f('Entrega internacional', 'deliveryIntl', c.deliveryIntl) +
      '</div>' +
      '<label class="ed-f"><span>Texto de garantía</span><textarea data-conf="warranty" rows="3">' + esc(c.warranty) + '</textarea></label>' +
      '<p class="ed-tip">Los métodos de pago (Wompi, contra entrega) y las llaves se configuran en <b>js/config.js</b> por seguridad.</p>' +
      '</div>';
  }

  /* ================= LEGAL ================= */
  function viewLegal() {
    return '<div class="ed-bar">' +
        '<span class="ed-dirty" data-dirty="legal">' + (S.dirty.legal ? '● Cambios sin guardar' : '') + '</span>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn-accent" data-act="legal-save">' + icon('check') + 'Guardar textos</button>' +
      '</div>' +
      '<p class="ed-tip">Formato: <b>## Subtítulo</b> para títulos, <b>- </b> al inicio para viñetas, línea en blanco separa párrafos, <b>**negrita**</b> y <b>[texto](enlace)</b>. Al guardar, las páginas de Términos y Privacidad se actualizan solas.</p>' +
      '<div class="ed-legal">' +
        '<div class="ed-legal-col"><div class="ed-legal-h"><b>Términos y Política de uso</b>' +
          '<button class="btn btn-sm" data-act="legal-load" data-key="terminos">Cargar texto actual</button>' +
          '<a class="btn btn-sm" href="/terminos.html" target="_blank" rel="noopener">Ver página</a></div>' +
          '<textarea data-legal="terminos" rows="16" placeholder="Escribe aquí los Términos…">' + esc(S.legal.terminos) + '</textarea></div>' +
        '<div class="ed-legal-col"><div class="ed-legal-h"><b>Política de privacidad</b>' +
          '<button class="btn btn-sm" data-act="legal-load" data-key="privacidad">Cargar texto actual</button>' +
          '<a class="btn btn-sm" href="/privacidad.html" target="_blank" rel="noopener">Ver página</a></div>' +
          '<textarea data-legal="privacidad" rows="16" placeholder="Escribe aquí la Política…">' + esc(S.legal.privacidad) + '</textarea></div>' +
      '</div>';
  }

  /* ---------- guardado ---------- */
  function normalizeCatalog() {
    S.cat.products.forEach(function (p) {
      p.price = toNum(p.price);
      p.was = toNum(p.was);
      if (!p.imgs) p.imgs = p.img ? [p.img] : [];
      p.imgs = p.imgs.filter(function (u) { return u && String(u).trim(); });
      p.img = p.imgs[0] || '';
      if (Array.isArray(p.features)) p.features = p.features.map(function (x) { return String(x).trim(); }).filter(Boolean);
      if (Array.isArray(p.specs)) p.specs = p.specs.map(function (x) { return String(x).trim(); }).filter(Boolean);
    });
  }
  function saveCatalog() {
    normalizeCatalog();
    var btns = root.querySelectorAll('[data-act="catalog-save"]');
    Array.prototype.forEach.call(btns, function (b) { b.disabled = true; b.textContent = 'Guardando…'; });
    db.collection('site').doc('catalog').set({
      products: S.cat.products, categories: S.cat.categories, updatedAtTs: Date.now(),
    }).then(function () {
      S.catExists = true; S.dirty.catalog = false;
      toast('✅ Publicado. La tienda ya muestra los cambios.');
      draw();
    }).catch(function (e) {
      toast('No se pudo guardar: ' + (e && e.message || e));
      Array.prototype.forEach.call(root.querySelectorAll('[data-act="catalog-save"]'), function (b) { b.disabled = false; b.innerHTML = icon('check') + 'Guardar y publicar'; });
    });
  }
  function saveConfig() {
    var c = S.conf;
    c.shippingFlat = toNum(c.shippingFlat); c.freeShippingFrom = toNum(c.freeShippingFrom);
    db.collection('site').doc('config').set({
      storeName: c.storeName, whatsapp: String(c.whatsapp || '').replace(/\D/g, ''),
      currency: 'COP', warranty: c.warranty,
      shippingFlat: c.shippingFlat, freeShippingFrom: c.freeShippingFrom,
      deliveryCO: c.deliveryCO, deliveryIntl: c.deliveryIntl, updatedAtTs: Date.now(),
    }, { merge: true }).then(function () {
      S.confExists = true; S.dirty.config = false; toast('✅ Ajustes guardados.'); draw();
    }).catch(function (e) { toast('No se pudo guardar: ' + (e && e.message || e)); });
  }
  function saveLegal() {
    db.collection('site').doc('legal').set({
      terminos: S.legal.terminos, privacidad: S.legal.privacidad, updatedAtTs: Date.now(),
    }, { merge: true }).then(function () {
      S.legalExists = true; S.dirty.legal = false; toast('✅ Textos guardados. Las páginas ya los muestran.'); draw();
    }).catch(function (e) { toast('No se pudo guardar: ' + (e && e.message || e)); });
  }

  /* ---------- subida de imágenes ---------- */
  function resizeImage(file, maxDim, quality) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { resolve(b || file); }, 'image/jpeg', quality || 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }
  function uploadFiles(productId, files) {
    initFb();
    var statusEl = root.querySelector('[data-up="' + productId + '"]');
    if (!storage) { if (statusEl) statusEl.textContent = '⚠️ Activa Storage en Firebase para subir fotos o videos.'; return; }
    var p = findProd(productId); if (!p) return;
    if (!p.imgs) p.imgs = p.img ? [p.img] : [];
    var arr = Array.prototype.slice.call(files);
    var done = 0, total = arr.length;
    if (statusEl) statusEl.textContent = 'Subiendo 0/' + total + '…';
    arr.reduce(function (chain, file) {
      return chain.then(function () {
        var isVid = /^video\//.test(file.type) || isVideo(file.name);
        var prep = isVid ? Promise.resolve(file) : resizeImage(file, 1400, 0.85);
        return prep.then(function (blob) {
          var ext = isVid ? (String(file.name).match(/\.[a-z0-9]+$/i) || ['.mp4'])[0] : '.jpg';
          var ctype = isVid ? (file.type || 'video/mp4') : 'image/jpeg';
          var base = String(file.name || 'media').replace(/\.[^.]+$/, '').replace(/[^\w\-]/g, '_').slice(0, 40) || 'media';
          var path = 'products/' + productId + '/' + Date.now() + '-' + base + ext;
          var refx = storage.ref().child(path);
          return refx.put(blob, { contentType: ctype }).then(function (snap) { return snap.ref.getDownloadURL(); })
            .then(function (url) { p.imgs.push(url); done++; if (statusEl) statusEl.textContent = 'Subiendo ' + done + '/' + total + '…'; });
        });
      });
    }, Promise.resolve()).then(function () {
      setDirty('catalog'); S.flashId = productId;
      if (statusEl) statusEl.textContent = '✅ ' + done + ' archivo(s) subido(s). No olvides Guardar y publicar.';
      draw();
    }).catch(function (e) {
      if (statusEl) statusEl.textContent = '⚠️ No se pudo subir: ' + (e && e.message || e);
    });
  }

  function uploadCatImage(cid, file) {
    initFb();
    var c = S.cat.categories.filter(function (x) { return x.id === cid; })[0];
    if (!c) return;
    if (!storage) { toast('Activa Storage en Firebase para subir fotos.'); return; }
    toast('Subiendo foto de categoría…');
    resizeImage(file, 800, 0.85).then(function (blob) {
      var path = 'products/cat/' + cid + '/' + Date.now() + '.jpg';
      return storage.ref().child(path).put(blob, { contentType: 'image/jpeg' }).then(function (s) { return s.ref.getDownloadURL(); });
    }).then(function (url) {
      c.img = url; setDirty('catalog'); toast('✅ Foto lista. Guarda y publica.'); draw();
    }).catch(function (e) { toast('No se pudo subir: ' + (e && e.message || e)); });
  }

  /* ---------- arrastrar para reordenar ---------- */
  function moveProd(fromId, toId) {
    if (!fromId || fromId === toId) return;
    var arr = S.cat.products, fi = idxProd(fromId);
    if (fi < 0) return;
    var item = arr.splice(fi, 1)[0];
    var ti = idxProd(toId); if (ti < 0) ti = arr.length;
    arr.splice(ti, 0, item); S.flashId = fromId; setDirty('catalog'); draw();
  }
  function moveCat(fromId, toId) {
    if (!fromId || fromId === toId) return;
    var arr = S.cat.categories;
    function idx(id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return i; return -1; }
    var fi = idx(fromId); if (fi < 0) return;
    var item = arr.splice(fi, 1)[0];
    var ti = idx(toId); if (ti < 0) ti = arr.length;
    arr.splice(ti, 0, item); S.flashId = fromId; setDirty('catalog'); draw();
  }
  function onDragStart(e) {
    var h = e.target.closest && e.target.closest('[data-draghandle]');
    if (!h) return;
    S.dragId = h.getAttribute('data-id'); S.dragKind = h.getAttribute('data-dragkind');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', S.dragId || ''); } catch (_) {}
  }
  function onDragOver(e) { if (S.dragId) e.preventDefault(); }
  function onDrop(e) {
    if (!S.dragId) return;
    e.preventDefault();
    if (S.dragKind === 'prod') { var r = e.target.closest('[data-pid]'); if (r) moveProd(S.dragId, r.getAttribute('data-pid')); }
    else if (S.dragKind === 'cat') { var cr = e.target.closest('[data-cidrow]'); if (cr) moveCat(S.dragId, cr.getAttribute('data-cidrow')); }
    S.dragId = null; S.dragKind = null;
  }

  /* ---------- eventos ---------- */
  function onClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    var id = b.getAttribute('data-id');
    var cid = b.getAttribute('data-cid');

    if (act === 'catalog-save') return saveCatalog();
    if (act === 'config-save') return saveConfig();
    if (act === 'legal-save') return saveLegal();

    if (b.hasAttribute('data-sub')) { /* handled below */ }

    // productos
    if (act === 'prod-add') {
      var defCat = (S.prodFilter && S.prodFilter !== 'all') ? S.prodFilter : ((S.cat.categories[0] || {}).id || '');
      var np = { id: genId('p'), name: 'Nuevo producto', cat: defCat, price: 0, was: 0, badge: '', short: '', description: '', dropiId: '', provider: '', icon: '', features: [], specs: [], imgs: [], img: '' };
      S.cat.products.unshift(np); S.openId = np.id; S.flashId = np.id; setDirty('catalog'); return draw();
    }
    if (act === 'prod-toggle') { S.openId = (S.openId === id ? null : id); return draw(); }
    if (act === 'prod-del') {
      if (!confirm('¿Eliminar este producto?')) return;
      S.cat.products = S.cat.products.filter(function (p) { return p.id !== id; });
      if (S.openId === id) S.openId = null; setDirty('catalog'); return draw();
    }
    if (act === 'prod-up' || act === 'prod-down') {
      var filt = S.prodFilter || 'all';
      var lst = filt === 'all' ? S.cat.products : S.cat.products.filter(function (p) { return p.cat === filt; });
      var fi = -1; for (var z = 0; z < lst.length; z++) if (lst[z].id === id) fi = z;
      var fj = act === 'prod-up' ? fi - 1 : fi + 1;
      if (fi < 0 || fj < 0 || fj >= lst.length) return;
      var gi = idxProd(lst[fi].id), gj = idxProd(lst[fj].id);
      var t = S.cat.products[gi]; S.cat.products[gi] = S.cat.products[gj]; S.cat.products[gj] = t;
      S.flashId = id; setDirty('catalog'); return draw();
    }

    // imágenes
    if (act === 'img-url') {
      var inp = root.querySelector('.ed-url[data-id="' + id + '"]');
      var u = inp && inp.value.trim();
      if (!u) return;
      var p = findProd(id); if (!p) return; if (!p.imgs) p.imgs = p.img ? [p.img] : [];
      p.imgs.push(u); setDirty('catalog'); return draw();
    }
    if (act === 'img-del' || act === 'img-up' || act === 'img-down' || act === 'img-main') {
      var pp = findProd(id); if (!pp || !pp.imgs) return;
      var k = Number(b.getAttribute('data-i'));
      if (act === 'img-del') { pp.imgs.splice(k, 1); }
      else if (act === 'img-main') { var it = pp.imgs.splice(k, 1)[0]; pp.imgs.unshift(it); }
      else { var m = act === 'img-up' ? k - 1 : k + 1; if (m < 0 || m >= pp.imgs.length) return; var tmp = pp.imgs[k]; pp.imgs[k] = pp.imgs[m]; pp.imgs[m] = tmp; }
      setDirty('catalog'); return draw();
    }

    // foto de categoría
    if (act === 'catimg-del') {
      var cc = S.cat.categories.filter(function (x) { return x.id === cid; })[0];
      if (cc) { delete cc.img; setDirty('catalog'); draw(); }
      return;
    }

    // categorías
    if (act === 'cat-add') {
      S.cat.categories.push({ id: genId('c'), name: 'Nueva categoría', desc: '', icon: iconKeys()[0] || '' });
      setDirty('catalog'); return draw();
    }
    if (act === 'cat-del') {
      var used = S.cat.products.filter(function (p) { return p.cat === cid; }).length;
      if (used) return alert('No puedes eliminar esta categoría: ' + used + ' producto(s) la usan. Cámbialos de categoría primero.');
      if (!confirm('¿Eliminar esta categoría?')) return;
      S.cat.categories = S.cat.categories.filter(function (c) { return c.id !== cid; });
      setDirty('catalog'); return draw();
    }
    if (act === 'cat-up' || act === 'cat-down') {
      var ci = -1; for (var x = 0; x < S.cat.categories.length; x++) if (S.cat.categories[x].id === cid) ci = x;
      var cj = act === 'cat-up' ? ci - 1 : ci + 1;
      if (ci < 0 || cj < 0 || cj >= S.cat.categories.length) return;
      var ct = S.cat.categories[ci]; S.cat.categories[ci] = S.cat.categories[cj]; S.cat.categories[cj] = ct;
      S.flashId = cid; setDirty('catalog'); return draw();
    }

    // legal
    if (act === 'legal-load') {
      var key = b.getAttribute('data-key');
      if (window.LEGAL && window.LEGAL.defaults[key]) {
        S.legal[key] = window.LEGAL.defaults[key]; setDirty('legal'); return draw();
      }
    }
  }

  function onChangeInput(e) {
    var t = e.target;
    // filtro de categoría en Productos
    if (t.hasAttribute('data-prodfilter')) { S.prodFilter = t.value; draw(); return; }
    // producto: campos
    if (t.hasAttribute('data-field')) {
      var p = findProd(t.getAttribute('data-id')); if (!p) return;
      var f = t.getAttribute('data-field');
      if (f === 'features' || f === 'specs') p[f] = t.value.split('\n');
      else p[f] = t.value;
      setDirty('catalog'); return;
    }
    // categoría: campos
    if (t.hasAttribute('data-cfield')) {
      var c = S.cat.categories.filter(function (x) { return x.id === t.getAttribute('data-cid'); })[0];
      if (!c) return; c[t.getAttribute('data-cfield')] = t.value; setDirty('catalog'); return;
    }
    // ajustes
    if (t.hasAttribute('data-conf')) { S.conf[t.getAttribute('data-conf')] = t.value; setDirty('config'); return; }
    // legal
    if (t.hasAttribute('data-legal')) { S.legal[t.getAttribute('data-legal')] = t.value; setDirty('legal'); return; }
    // subida de fotos / videos
    if (t.getAttribute('data-act') === 'img-upload' && t.files && t.files.length) {
      uploadFiles(t.getAttribute('data-id'), t.files); t.value = '';
    }
    // subida de foto de categoría
    if (t.getAttribute('data-act') === 'catimg-upload' && t.files && t.files.length) {
      uploadCatImage(t.getAttribute('data-cid'), t.files[0]); t.value = '';
    }
  }

  function onClickSub(e) {
    var s = e.target.closest('[data-sub]');
    if (!s) return;
    S.sub = s.getAttribute('data-sub'); draw();
  }

  function bind() {
    if (root.__edBound) return;
    root.addEventListener('click', onClickSub);
    root.addEventListener('click', onClick);
    root.addEventListener('input', onChangeInput);
    root.addEventListener('change', onChangeInput);
    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.__edBound = true;
  }

  window.MSEditor = {
    render: function (container) {
      root = container;
      bind();
      if (!S.loaded) load(); else draw();
    },
  };
})();
