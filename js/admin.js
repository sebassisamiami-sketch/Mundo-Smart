/*
 * admin.js — Panel de administración de Mundo Smart.
 * - Entra SOLO con la cuenta de Google autorizada (window.ADMIN_EMAIL).
 * - La verificación en 2 pasos la exige Google al iniciar sesión (2FA de la cuenta).
 * - La sesión se cierra sola pasadas window.ADMIN_SESSION_HOURS (6 h).
 * - Lee pedidos e intentos de carrito desde Firestore en tiempo real.
 */
(function () {
  'use strict';
  var cfg = window.FIREBASE_CONFIG || {};
  var ADMIN_EMAIL = String(window.ADMIN_EMAIL || '').trim().toLowerCase();
  var SESSION_MS = (Number(window.ADMIN_SESSION_HOURS) || 6) * 3600 * 1000;
  var SKEY = 'ms_admin_session_start';

  var $ = function (s) { return document.querySelector(s); };
  var el = {
    login: $('#loginView'), app: $('#appView'),
    gbtn: $('#googleBtn'), err: $('#loginErr'), note: $('#loginNote'),
    whoImg: $('#whoImg'), whoName: $('#whoName'),
    sessionTag: $('#sessionTag'), logout: $('#logoutBtn'),
    stats: $('#stats'), tableArea: $('#tableArea'), tools: $('#ordersTools'),
    search: $('#search'), fStatus: $('#fStatus'), fPay: $('#fPay'),
    exportBtn: $('#exportBtn'), modal: $('#modal'),
    tabs: document.querySelectorAll('.tab'),
  };

  var auth = null, db = null;
  var orders = [], attempts = [];
  var ordersUnsub = null, attemptsUnsub = null;
  var activeTab = 'orders', sessionTimer = null, tagTimer = null;

  var ORDER_STATES = ['nuevo', 'confirmado', 'despachado', 'entregado', 'cancelado'];
  var PAY_NAMES = { contraentrega: 'Contra entrega', 'por-confirmar': 'A confirmar',
    wompi: 'Wompi', epayco: 'ePayco', mercadopago: 'Mercado Pago' };

  /* ---------- Utilidades ---------- */
  function money(n) {
    n = Number(n) || 0;
    return '$' + n.toLocaleString('es-CO');
  }
  function when(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function showErr(msg) {
    el.err.textContent = msg; el.err.classList.remove('hidden');
  }
  function clearErr() { el.err.classList.add('hidden'); }

  /* ---------- Firebase sin configurar ---------- */
  function configured() { return !!(cfg.apiKey && cfg.projectId); }

  if (!configured()) {
    el.gbtn.disabled = true;
    el.gbtn.style.opacity = '.5';
    el.gbtn.style.cursor = 'not-allowed';
    el.note.innerHTML = '⚙️ Falta conectar Firebase.<br>Pega la configuración de tu proyecto en <b>js/firebase-config.js</b> y vuelve a publicar.';
    return;
  }

  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    auth = firebase.auth();
    db = firebase.firestore();
  } catch (e) {
    showErr('No se pudo inicializar Firebase. Revisa js/firebase-config.js.');
    return;
  }

  el.note.innerHTML = 'Solo <b>' + esc(ADMIN_EMAIL) + '</b> puede entrar. ' +
    'Al iniciar sesión, Google pedirá tu verificación en 2 pasos.';

  /* ---------- Sesión de 6 horas ---------- */
  function sessionStart() { return Number(localStorage.getItem(SKEY) || 0); }
  function sessionRemaining() {
    var s = sessionStart();
    if (!s) return SESSION_MS;
    return SESSION_MS - (Date.now() - s);
  }
  function startSessionClock() {
    if (!sessionStart()) localStorage.setItem(SKEY, String(Date.now()));
    scheduleExpiry();
    updateSessionTag();
    clearInterval(tagTimer);
    tagTimer = setInterval(updateSessionTag, 30000);
  }
  function scheduleExpiry() {
    clearTimeout(sessionTimer);
    var ms = sessionRemaining();
    if (ms <= 0) return expireSession();
    sessionTimer = setTimeout(expireSession, ms);
  }
  function updateSessionTag() {
    var ms = sessionRemaining();
    if (ms <= 0) return expireSession();
    var h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    el.sessionTag.textContent = '🔒 Sesión: ' + (h > 0 ? h + 'h ' : '') + m + 'm restantes';
  }
  function expireSession() {
    clearTimeout(sessionTimer); clearInterval(tagTimer);
    localStorage.removeItem(SKEY);
    if (auth.currentUser) auth.signOut();
    showErr('Tu sesión expiró (máximo ' + (SESSION_MS / 3600000) + ' horas). Entra de nuevo.');
  }

  /* ---------- Login / Logout ---------- */
  el.gbtn.addEventListener('click', function () {
    clearErr();
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account', login_hint: ADMIN_EMAIL });
    auth.signInWithPopup(provider).catch(function (e) {
      if (e && e.code === 'auth/popup-closed-by-user') return;
      if (e && e.code === 'auth/unauthorized-domain')
        return showErr('Este dominio no está autorizado en Firebase Auth. Agrégalo en Authentication → Settings → Dominios autorizados.');
      showErr('No se pudo iniciar sesión. ' + (e && e.message ? e.message : ''));
    });
  });

  el.logout.addEventListener('click', function () {
    localStorage.removeItem(SKEY);
    auth.signOut();
  });

  auth.onAuthStateChanged(function (user) {
    if (!user) return toLogin();
    var email = String(user.email || '').toLowerCase();
    if (email !== ADMIN_EMAIL) {
      auth.signOut();
      localStorage.removeItem(SKEY);
      return showErr('La cuenta ' + esc(email) + ' no está autorizada para este panel.');
    }
    // Email correcto: valida la ventana de 6 horas
    if (sessionStart() && sessionRemaining() <= 0) return expireSession();
    enterPanel(user);
  });

  function toLogin() {
    clearTimeout(sessionTimer); clearInterval(tagTimer);
    if (ordersUnsub) { ordersUnsub(); ordersUnsub = null; }
    if (attemptsUnsub) { attemptsUnsub(); attemptsUnsub = null; }
    el.app.classList.add('hidden');
    el.login.classList.remove('hidden');
  }

  function enterPanel(user) {
    clearErr();
    el.whoImg.src = user.photoURL || '';
    el.whoName.textContent = user.displayName || user.email;
    el.login.classList.add('hidden');
    el.app.classList.remove('hidden');
    startSessionClock();
    subscribe();
  }

  /* ---------- Datos en tiempo real ---------- */
  function subscribe() {
    if (!ordersUnsub) {
      ordersUnsub = db.collection('orders').orderBy('createdAtTs', 'desc')
        .onSnapshot(function (snap) {
          orders = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
          render();
        }, function (e) { el.tableArea.innerHTML = dbError(e); });
    }
    if (!attemptsUnsub) {
      attemptsUnsub = db.collection('attempts').orderBy('createdAtTs', 'desc').limit(300)
        .onSnapshot(function (snap) {
          attempts = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
          render();
        }, function () {});
    }
  }
  function dbError(e) {
    var msg = (e && e.code === 'permission-denied')
      ? 'Sin permiso para leer. Publica las reglas de Firestore (backend/firestore.rules) con tu correo.'
      : 'No se pudieron cargar los datos. ' + (e && e.message ? e.message : '');
    return '<div class="empty">⚠️ ' + esc(msg) + '</div>';
  }

  /* ---------- Render ---------- */
  function render() {
    renderStats();
    el.tools.style.display = activeTab === 'orders' ? 'flex' : 'none';
    if (activeTab === 'orders') renderOrders();
    else renderAttempts();
  }

  function renderStats() {
    var sold = orders.filter(function (o) {
      return ['confirmado', 'despachado', 'entregado'].indexOf(o.status) > -1;
    });
    var revenue = sold.reduce(function (a, o) { return a + (Number(o.total) || 0); }, 0);
    var nuevos = orders.filter(function (o) { return o.status === 'nuevo'; }).length;
    var abandon = attempts.filter(function (a) { return a.status !== 'completado'; }).length;
    var cards = [
      ['Pedidos', orders.length, ''],
      ['Ventas confirmadas', money(revenue), 'sm'],
      ['Nuevos por revisar', nuevos, ''],
      ['Carritos sin pagar', abandon, ''],
    ];
    el.stats.innerHTML = cards.map(function (c) {
      return '<div class="stat"><p class="k">' + c[0] + '</p><p class="v ' + c[2] + '">' + c[1] + '</p></div>';
    }).join('');
  }

  function filteredOrders() {
    var q = el.search.value.trim().toLowerCase();
    var fs = el.fStatus.value, fp = el.fPay.value;
    return orders.filter(function (o) {
      if (fs && o.status !== fs) return false;
      if (fp && o.payment !== fp) return false;
      if (q) {
        var c = o.customer || {};
        var hay = [o.ref, c.name, c.phone, c.city].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function stPill(s) {
    s = s || 'nuevo';
    return '<span class="st st-' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</span>';
  }

  function renderOrders() {
    var list = filteredOrders();
    if (!orders.length) {
      el.tableArea.innerHTML = '<div class="table-wrap"><div class="empty">Aún no hay pedidos. Cuando un cliente compre, aparecerá aquí.</div></div>';
      return;
    }
    if (!list.length) {
      el.tableArea.innerHTML = '<div class="table-wrap"><div class="empty">Ningún pedido coincide con el filtro.</div></div>';
      return;
    }
    var rows = list.map(function (o, i) {
      var c = o.customer || {};
      return '<tr data-i="' + orders.indexOf(o) + '">' +
        '<td data-l="Fecha">' + esc(when(o.createdAtTs)) + '</td>' +
        '<td data-l="Pedido"><span class="mono">' + esc(o.ref) + '</span></td>' +
        '<td data-l="Cliente">' + esc(c.name || '—') + '</td>' +
        '<td data-l="Teléfono">' + esc(c.phone || '—') + '</td>' +
        '<td data-l="Total" class="money">' + money(o.total) + '</td>' +
        '<td data-l="Pago"><span class="pay-tag">' + esc(PAY_NAMES[o.payment] || o.payment || '—') + '</span></td>' +
        '<td data-l="Estado">' + stPill(o.status) + '</td>' +
      '</tr>';
    }).join('');
    el.tableArea.innerHTML =
      '<div class="table-wrap"><table><thead><tr>' +
      '<th>Fecha</th><th>Pedido</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Pago</th><th>Estado</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    Array.prototype.forEach.call(el.tableArea.querySelectorAll('tbody tr'), function (tr) {
      tr.addEventListener('click', function () { openOrder(orders[+tr.getAttribute('data-i')]); });
    });
  }

  function renderAttempts() {
    if (!attempts.length) {
      el.tableArea.innerHTML = '<div class="table-wrap"><div class="empty">Aún no hay intentos de carrito registrados.</div></div>';
      return;
    }
    var rows = attempts.map(function (a) {
      var c = a.customer || {};
      var nItems = (a.items || []).reduce(function (s, it) { return s + (Number(it.qty) || 1); }, 0);
      var st = a.status === 'completado' ? 'completado' : 'abierto';
      return '<tr>' +
        '<td data-l="Fecha">' + esc(when(a.createdAtTs)) + '</td>' +
        '<td data-l="Cliente">' + esc(c.name || '—') + '</td>' +
        '<td data-l="Teléfono">' + esc(c.phone || '—') + '</td>' +
        '<td data-l="Artículos">' + nItems + '</td>' +
        '<td data-l="Total" class="money">' + money(a.total) + '</td>' +
        '<td data-l="Estado"><span class="st st-' + st + '">' + (st === 'completado' ? 'Compró' : 'Sin pagar') + '</span></td>' +
      '</tr>';
    }).join('');
    el.tableArea.innerHTML =
      '<div class="table-wrap"><table><thead><tr>' +
      '<th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Artículos</th><th>Total</th><th>Estado</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---------- Modal detalle de pedido ---------- */
  function openOrder(o) {
    if (!o) return;
    var c = o.customer || {};
    var loc = [c.city, c.department, o.country === 'CO' ? 'Colombia' : (o.country ? 'Otro país' : '')].filter(Boolean).join(', ');
    var items = (o.items || []).map(function (it) {
      return '<div class="it"><span>' + esc(it.name) + ' <span class="q">×' + (it.qty || 1) + '</span></span>' +
             '<span>' + money((it.price || 0) * (it.qty || 1)) + '</span></div>';
    }).join('') || '<div class="it"><span class="q">Sin artículos</span></div>';

    var stateBtns = ORDER_STATES.map(function (s) {
      var active = (o.status || 'nuevo') === s;
      return '<button class="btn" data-s="' + s + '"' + (active ? ' style="border-color:var(--accent);background:var(--card2)"' : '') + '>' +
             s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
    }).join('');

    var waPhone = (c.phone || '').replace(/\D/g, '');
    var waHref = waPhone ? ('https://wa.me/57' + waPhone) : '';

    el.modal.innerHTML =
      '<div class="modal"><div class="modal-h"><h3>Pedido <span class="mono">' + esc(o.ref) + '</span></h3>' +
        '<button class="x" id="mClose">×</button></div>' +
      '<div class="modal-b">' +
        '<div class="kv">' +
          '<span class="k">Fecha</span><span>' + esc(when(o.createdAtTs)) + '</span>' +
          '<span class="k">Estado</span><span>' + stPill(o.status) + '</span>' +
          '<span class="k">Cliente</span><span>' + esc(c.name || '—') + '</span>' +
          '<span class="k">Teléfono</span><span>' + esc(c.phone || '—') + '</span>' +
          '<span class="k">Ubicación</span><span>' + esc(loc || '—') + '</span>' +
          '<span class="k">Dirección</span><span>' + esc(c.address || '—') + '</span>' +
          (c.notes ? '<span class="k">Notas</span><span>' + esc(c.notes) + '</span>' : '') +
          '<span class="k">Pago</span><span>' + esc(PAY_NAMES[o.payment] || o.payment || '—') + '</span>' +
        '</div>' +
        '<div class="items-l">' + items +
          '<div class="it"><span class="q">Subtotal</span><span>' + money(o.subtotal) + '</span></div>' +
          '<div class="it"><span class="q">Envío</span><span>' + (o.shipping ? money(o.shipping) : 'Gratis') + '</span></div>' +
          '<div class="it"><span><b>Total</b></span><span class="money">' + money(o.total) + '</span></div>' +
        '</div>' +
        '<p class="k" style="color:var(--muted);font-size:12px;margin:0 0 8px">Cambiar estado</p>' +
        '<div class="status-row">' + stateBtns + '</div>' +
      '</div>' +
      '<div class="modal-foot">' +
        (waHref ? '<a class="btn" href="' + waHref + '" target="_blank" rel="noopener">💬 Escribir por WhatsApp</a>' : '') +
        '<button class="btn" id="mCloseFoot">Cerrar</button>' +
      '</div></div>';
    el.modal.classList.remove('hidden');

    function close() { el.modal.classList.add('hidden'); el.modal.innerHTML = ''; }
    $('#mClose').addEventListener('click', close);
    $('#mCloseFoot').addEventListener('click', close);
    el.modal.addEventListener('click', function (e) { if (e.target === el.modal) close(); });
    Array.prototype.forEach.call(el.modal.querySelectorAll('[data-s]'), function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-s');
        db.collection('orders').doc(o._id).set({ status: s }, { merge: true })
          .then(close)
          .catch(function () { alert('No se pudo cambiar el estado.'); });
      });
    });
  }

  /* ---------- Pestañas ---------- */
  Array.prototype.forEach.call(el.tabs, function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(el.tabs, function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      activeTab = t.getAttribute('data-tab');
      render();
    });
  });
  el.search.addEventListener('input', renderOrders);
  el.fStatus.addEventListener('change', renderOrders);
  el.fPay.addEventListener('change', renderOrders);

  /* ---------- Exportar CSV ---------- */
  el.exportBtn.addEventListener('click', function () {
    var list = filteredOrders();
    if (!list.length) return alert('No hay pedidos para exportar.');
    var head = ['Pedido', 'Fecha', 'Cliente', 'Telefono', 'Ciudad', 'Departamento', 'Pais', 'Pago', 'Estado', 'Subtotal', 'Envio', 'Total', 'Articulos'];
    var rows = list.map(function (o) {
      var c = o.customer || {};
      var its = (o.items || []).map(function (it) { return (it.qty || 1) + 'x ' + it.name; }).join(' | ');
      return [o.ref, when(o.createdAtTs), c.name, c.phone, c.city, c.department,
        o.country === 'CO' ? 'Colombia' : 'Otro', PAY_NAMES[o.payment] || o.payment,
        o.status, o.subtotal, o.shipping, o.total, its];
    });
    var csv = [head].concat(rows).map(function (r) {
      return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mundo-smart-pedidos-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();
