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
    cat: { products: [], categories: [] }, catExists: false,
    conf: {}, confExists: false,
    legal: { terminos: '', privacidad: '' }, legalExists: false,
    dirty: { catalog: false, config: false, legal: false },
    openId: null,
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
    var subs = [['productos', '📦 Productos'], ['categorias', '🏷 Categorías'], ['ajustes', '⚙️ Ajustes'], ['legal', '📄 Textos y políticas']];
    var tabs = subs.map(function (s) {
      return '<button class="ed-subtab' + (S.sub === s[0] ? ' on' : '') + '" data-sub="' + s[0] + '">' + s[1] + '</button>';
    }).join('');
    var body = S.sub === 'productos' ? viewProductos()
      : S.sub === 'categorias' ? viewCategorias()
      : S.sub === 'ajustes' ? viewAjustes()
      : viewLegal();
    root.innerHTML = '<div class="ed">' +
      '<div class="ed-intro">Edita tu tienda aquí. Los cambios se publican al tocar <b>Guardar</b> y se ven en la tienda al instante.</div>' +
      '<div class="ed-subtabs">' + tabs + '</div>' +
      '<div class="ed-body">' + body + '</div></div>';
  }

  /* ================= PRODUCTOS ================= */
  function viewProductos() {
    var hint = S.catExists ? '' : '<div class="ed-note">Estás viendo tu catálogo actual. Toca <b>Guardar y publicar</b> una vez para empezar a editarlo en vivo.</div>';
    var rows = S.cat.products.map(function (p, i) { return productRow(p, i); }).join('');
    if (!S.cat.products.length) rows = '<div class="empty">No hay productos. Agrega el primero.</div>';
    return hint +
      '<div class="ed-bar">' +
        '<button class="btn btn-accent" data-act="prod-add">➕ Nuevo producto</button>' +
        '<span class="ed-count">' + S.cat.products.length + ' productos</span>' +
        '<span class="spacer"></span>' +
        '<span class="ed-dirty" data-dirty="catalog">' + (S.dirty.catalog ? '● Cambios sin guardar' : '') + '</span>' +
        '<button class="btn btn-accent" data-act="catalog-save">💾 Guardar y publicar</button>' +
      '</div>' +
      '<div class="ed-list">' + rows + '</div>';
  }

  function productRow(p, i) {
    var open = S.openId === p.id;
    var thumb = (imgsOf(p)[0]) ? '<img src="' + esc(imgsOf(p)[0]) + '" alt="">' : '<span class="ph">▣</span>';
    var head = '<div class="ed-row-h">' +
        '<div class="ed-thumb">' + thumb + '</div>' +
        '<div class="ed-row-main"><b>' + esc(p.name || '(sin nombre)') + '</b>' +
          '<span class="ed-row-sub">' + esc(catName(p.cat)) + ' · ' + money(p.price) + (p.badge ? ' · ' + esc(p.badge) : '') + '</span></div>' +
        '<div class="ed-row-actions">' +
          '<button class="ic" data-act="prod-up" data-id="' + esc(p.id) + '" title="Subir">▲</button>' +
          '<button class="ic" data-act="prod-down" data-id="' + esc(p.id) + '" title="Bajar">▼</button>' +
          '<button class="ic" data-act="prod-toggle" data-id="' + esc(p.id) + '">' + (open ? 'Cerrar' : '✏️ Editar') + '</button>' +
          '<button class="ic ic-danger" data-act="prod-del" data-id="' + esc(p.id) + '" title="Eliminar">🗑</button>' +
        '</div></div>';
    if (!open) return '<div class="ed-row">' + head + '</div>';
    return '<div class="ed-row open">' + head + productForm(p) + '</div>';
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
      return '<div class="ed-img">' + (i === 0 ? '<span class="ed-main">★ Principal</span>' : '') +
        '<img src="' + esc(u) + '" alt="">' +
        '<div class="ed-img-acts">' +
          '<button class="ic" data-act="img-up" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Mover izquierda">◀</button>' +
          '<button class="ic" data-act="img-down" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Mover derecha">▶</button>' +
          '<button class="ic ic-danger" data-act="img-del" data-id="' + esc(p.id) + '" data-i="' + i + '" title="Quitar">✕</button>' +
        '</div></div>';
    }).join('');
    if (!imgs.length) thumbs = '<div class="ed-img-empty">Sin fotos todavía.</div>';
    return '<div class="ed-images"><span class="ed-f-label">Fotos <small>(la primera es la principal)</small></span>' +
      '<div class="ed-img-grid">' + thumbs + '</div>' +
      '<div class="ed-img-add">' +
        '<label class="btn btn-sm">📤 Subir foto(s)<input type="file" accept="image/*" multiple data-act="img-upload" data-id="' + esc(p.id) + '" hidden></label>' +
        '<input type="url" class="ed-url" data-id="' + esc(p.id) + '" placeholder="…o pega el enlace de una imagen (https://…)">' +
        '<button class="btn btn-sm" data-act="img-url" data-id="' + esc(p.id) + '">Agregar enlace</button>' +
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
      return '<div class="ed-row open"><div class="ed-form">' +
        '<div class="ed-grid">' +
          '<label class="ed-f"><span>Nombre</span><input data-cfield="name" data-cid="' + esc(c.id) + '" value="' + esc(c.name) + '"></label>' +
          '<label class="ed-f"><span>Descripción</span><input data-cfield="desc" data-cid="' + esc(c.id) + '" value="' + esc(c.desc) + '"></label>' +
          '<label class="ed-f"><span>Ícono</span><select data-cfield="icon" data-cid="' + esc(c.id) + '">' + icons + '</select></label>' +
          '<label class="ed-f"><span>ID (no cambiar)</span><input value="' + esc(c.id) + '" disabled></label>' +
        '</div>' +
        '<div class="ed-row-actions" style="justify-content:flex-start">' +
          '<button class="ic" data-act="cat-up" data-cid="' + esc(c.id) + '">▲</button>' +
          '<button class="ic" data-act="cat-down" data-cid="' + esc(c.id) + '">▼</button>' +
          '<span class="ed-count">' + used + ' productos</span>' +
          '<button class="ic ic-danger" data-act="cat-del" data-cid="' + esc(c.id) + '">🗑 Eliminar</button>' +
        '</div></div></div>';
    }).join('');
    if (!S.cat.categories.length) rows = '<div class="empty">No hay categorías.</div>';
    return '<div class="ed-bar">' +
        '<button class="btn btn-accent" data-act="cat-add">➕ Nueva categoría</button>' +
        '<span class="spacer"></span>' +
        '<span class="ed-dirty" data-dirty="catalog">' + (S.dirty.catalog ? '● Cambios sin guardar' : '') + '</span>' +
        '<button class="btn btn-accent" data-act="catalog-save">💾 Guardar y publicar</button>' +
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
        '<button class="btn btn-accent" data-act="config-save">💾 Guardar ajustes</button>' +
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
        '<button class="btn btn-accent" data-act="legal-save">💾 Guardar textos</button>' +
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
      Array.prototype.forEach.call(root.querySelectorAll('[data-act="catalog-save"]'), function (b) { b.disabled = false; b.textContent = '💾 Guardar y publicar'; });
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
    if (!storage) { if (statusEl) statusEl.textContent = '⚠️ Activa Storage en Firebase para subir fotos.'; return; }
    var p = findProd(productId); if (!p) return;
    if (!p.imgs) p.imgs = p.img ? [p.img] : [];
    var arr = Array.prototype.slice.call(files);
    var done = 0, total = arr.length;
    if (statusEl) statusEl.textContent = 'Subiendo 0/' + total + '…';
    arr.reduce(function (chain, file) {
      return chain.then(function () {
        return resizeImage(file, 1400, 0.85).then(function (blob) {
          var name = (file.name || 'foto').replace(/[^\w.\-]/g, '_').replace(/\.[^.]+$/, '') + '.jpg';
          var path = 'products/' + productId + '/' + Date.now() + '-' + name;
          var refx = storage.ref().child(path);
          return refx.put(blob, { contentType: 'image/jpeg' }).then(function (snap) { return snap.ref.getDownloadURL(); })
            .then(function (url) { p.imgs.push(url); done++; if (statusEl) statusEl.textContent = 'Subiendo ' + done + '/' + total + '…'; });
        });
      });
    }, Promise.resolve()).then(function () {
      setDirty('catalog');
      if (statusEl) statusEl.textContent = '✅ ' + done + ' foto(s) subida(s). No olvides Guardar y publicar.';
      draw();
    }).catch(function (e) {
      if (statusEl) statusEl.textContent = '⚠️ No se pudo subir: ' + (e && e.message || e);
    });
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
      var np = { id: genId('p'), name: 'Nuevo producto', cat: (S.cat.categories[0] || {}).id || '', price: 0, was: 0, badge: '', short: '', description: '', dropiId: '', provider: '', icon: '', features: [], specs: [], imgs: [], img: '' };
      S.cat.products.unshift(np); S.openId = np.id; setDirty('catalog'); return draw();
    }
    if (act === 'prod-toggle') { S.openId = (S.openId === id ? null : id); return draw(); }
    if (act === 'prod-del') {
      if (!confirm('¿Eliminar este producto?')) return;
      S.cat.products = S.cat.products.filter(function (p) { return p.id !== id; });
      if (S.openId === id) S.openId = null; setDirty('catalog'); return draw();
    }
    if (act === 'prod-up' || act === 'prod-down') {
      var i = idxProd(id), j = act === 'prod-up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= S.cat.products.length) return;
      var t = S.cat.products[i]; S.cat.products[i] = S.cat.products[j]; S.cat.products[j] = t;
      setDirty('catalog'); return draw();
    }

    // imágenes
    if (act === 'img-url') {
      var inp = root.querySelector('.ed-url[data-id="' + id + '"]');
      var u = inp && inp.value.trim();
      if (!u) return;
      var p = findProd(id); if (!p) return; if (!p.imgs) p.imgs = p.img ? [p.img] : [];
      p.imgs.push(u); setDirty('catalog'); return draw();
    }
    if (act === 'img-del' || act === 'img-up' || act === 'img-down') {
      var pp = findProd(id); if (!pp || !pp.imgs) return;
      var k = Number(b.getAttribute('data-i'));
      if (act === 'img-del') { pp.imgs.splice(k, 1); }
      else { var m = act === 'img-up' ? k - 1 : k + 1; if (m < 0 || m >= pp.imgs.length) return; var tmp = pp.imgs[k]; pp.imgs[k] = pp.imgs[m]; pp.imgs[m] = tmp; }
      setDirty('catalog'); return draw();
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
      setDirty('catalog'); return draw();
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
    // subtabs
    if (t.hasAttribute && false) {}
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
    // subida de fotos
    if (t.getAttribute('data-act') === 'img-upload' && t.files && t.files.length) {
      uploadFiles(t.getAttribute('data-id'), t.files); t.value = '';
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
