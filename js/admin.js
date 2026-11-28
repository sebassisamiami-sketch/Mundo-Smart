/*
 * admin.js — Panel de administración de Mundo Smart.
 * Entra solo con la cuenta de Google autorizada (window.ADMIN_EMAIL).
 * 2FA la exige Google al iniciar sesión. La sesión se cierra a las 6 horas.
 * Secciones: Resumen (métricas + gráfica + top productos), Pedidos, Intentos, Clientes.
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
    view: $('#view'), modal: $('#modal'),
    tabs: document.querySelectorAll('.tab'),
    ordersTools: $('#ordersTools'), attemptsTools: $('#attemptsTools'),
    search: $('#search'), fStatus: $('#fStatus'), fPay: $('#fPay'),
    fFrom: $('#fFrom'), fTo: $('#fTo'), exportBtn: $('#exportBtn'),
    fAttempt: $('#fAttempt'), exportAtt: $('#exportAtt'),
  };

  var auth = null, db = null;
  var orders = [], attempts = [];
  var ordersUnsub = null, attemptsUnsub = null;
  var activeTab = 'resumen', sessionTimer = null, tagTimer = null;

  var STATES = ['nuevo', 'confirmado', 'despachado', 'entregado', 'cancelado'];
  var SOLD = ['confirmado', 'despachado', 'entregado'];
  var PAY_NAMES = { contraentrega: 'Contra entrega', 'por-confirmar': 'A confirmar',
    wompi: 'Wompi', epayco: 'ePayco', mercadopago: 'Mercado Pago' };

  /* ---------- Utilidades ---------- */
  function money(n) { return '$' + (Number(n) || 0).toLocaleString('es-CO'); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function dayKey(ts) { var d = new Date(ts || 0); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
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
  function showErr(m) { el.err.textContent = m; el.err.classList.remove('hidden'); }
  function clearErr() { el.err.classList.add('hidden'); }
  function stPill(s) { s = s || 'nuevo'; return '<span class="st st-' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</span>'; }

  /* ---------- Firebase sin configurar ---------- */
  if (!(cfg.apiKey && cfg.projectId)) {
    el.gbtn.disabled = true; el.gbtn.style.opacity = '.5'; el.gbtn.style.cursor = 'not-allowed';
    el.note.innerHTML = '⚙️ Falta conectar Firebase.<br>Pega la configuración en <b>js/firebase-config.js</b> y vuelve a publicar.';
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    auth = firebase.auth(); db = firebase.firestore();
  } catch (e) { showErr('No se pudo inicializar Firebase.'); return; }
  el.note.innerHTML = 'Solo la cuenta autorizada puede entrar. Google pedirá tu verificación en 2 pasos.';

  /* ---------- Sesión de 6 horas ---------- */
  function sessionStart() { return Number(localStorage.getItem(SKEY) || 0); }
  function sessionRemaining() { var s = sessionStart(); return s ? SESSION_MS - (Date.now() - s) : SESSION_MS; }
  function startSessionClock() {
    if (!sessionStart()) localStorage.setItem(SKEY, String(Date.now()));
    scheduleExpiry(); updateSessionTag();
    clearInterval(tagTimer); tagTimer = setInterval(updateSessionTag, 30000);
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
    el.sessionTag.innerHTML = '<svg class="tic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Sesión ' + (h > 0 ? h + 'h ' : '') + m + 'm</span>';
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
        return showErr('Dominio no autorizado en Firebase Auth. Agrégalo en Authentication → Settings → Dominios autorizados.');
      showErr('No se pudo iniciar sesión. ' + (e && e.message ? e.message : ''));
    });
  });
  el.logout.addEventListener('click', function () { localStorage.removeItem(SKEY); auth.signOut(); });

  auth.onAuthStateChanged(function (user) {
    if (!user) return toLogin();
    var email = String(user.email || '').toLowerCase();
    if (email !== ADMIN_EMAIL) {
      auth.signOut(); localStorage.removeItem(SKEY);
      return showErr('La cuenta ' + esc(email) + ' no está autorizada.');
    }
    if (sessionStart() && sessionRemaining() <= 0) return expireSession();
    enterPanel(user);
  });

  function toLogin() {
    clearTimeout(sessionTimer); clearInterval(tagTimer);
    if (ordersUnsub) { ordersUnsub(); ordersUnsub = null; }
    if (attemptsUnsub) { attemptsUnsub(); attemptsUnsub = null; }
    el.app.classList.add('hidden'); el.login.classList.remove('hidden');
  }
  function enterPanel(user) {
    clearErr();
    el.whoImg.src = user.photoURL || '';
    el.whoName.textContent = user.displayName || user.email;
    el.login.classList.add('hidden'); el.app.classList.remove('hidden');
    startSessionClock(); subscribe();
  }

  /* ---------- Datos en tiempo real ---------- */
  function subscribe() {
    if (!ordersUnsub) {
      ordersUnsub = db.collection('orders').orderBy('createdAtTs', 'desc').onSnapshot(function (snap) {
        orders = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
        renderActive();
      }, function (e) { el.view.innerHTML = dbError(e); });
    }
    if (!attemptsUnsub) {
      attemptsUnsub = db.collection('attempts').orderBy('createdAtTs', 'desc').limit(400).onSnapshot(function (snap) {
        attempts = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
        renderActive();
      }, function () {});
    }
  }
  function dbError(e) {
    var msg = (e && e.code === 'permission-denied')
      ? 'Sin permiso para leer. Publica las reglas de Firestore (backend/firestore.rules).'
      : 'No se pudieron cargar los datos. ' + (e && e.message ? e.message : '');
    return '<div class="section"><div class="empty">⚠️ ' + esc(msg) + '</div></div>';
  }

  /* ---------- Pestañas y filtros ---------- */
  Array.prototype.forEach.call(el.tabs, function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(el.tabs, function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      activeTab = t.getAttribute('data-tab');
      el.ordersTools.classList.toggle('hidden', activeTab !== 'orders');
      el.attemptsTools.classList.toggle('hidden', activeTab !== 'attempts');
      renderActive();
    });
  });
  ['input', 'change'].forEach(function (ev) {
    [el.search, el.fStatus, el.fPay, el.fFrom, el.fTo].forEach(function (n) {
      n.addEventListener(ev, function () { if (activeTab === 'orders') renderOrders(); });
    });
    el.fAttempt.addEventListener(ev, function () { if (activeTab === 'attempts') renderAttempts(); });
  });

  function renderActive() {
    if (activeTab === 'editor') return (window.MSEditor && window.MSEditor.render(el.view));
    if (activeTab === 'resumen') return renderResumen();
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'attempts') return renderAttempts();
    if (activeTab === 'clientes') return renderClientes();
  }

  /* ---------- RESUMEN ---------- */
  function salesChart() {
    var days = 14, today = new Date(); today.setHours(0, 0, 0, 0);
    var buckets = [], map = {};
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today); d.setDate(d.getDate() - i);
      var b = { key: dayKey(d.getTime()), label: String(d.getDate()), d: d, val: 0 };
      buckets.push(b); map[b.key] = b;
    }
    orders.forEach(function (o) {
      if (SOLD.indexOf(o.status) === -1) return;
      var b = map[dayKey(o.createdAtTs)]; if (b) b.val += Number(o.total) || 0;
    });
    var total = buckets.reduce(function (a, b) { return a + b.val; }, 0);
    if (total === 0) return '<p class="empty" style="padding:34px">Sin ventas confirmadas en los últimos 14 días.</p>';
    var max = Math.max.apply(null, buckets.map(function (b) { return b.val; }).concat([1]));
    var W = 560, H = 180, pad = 24, bw = (W - pad * 2) / days;
    var bars = buckets.map(function (b, i) {
      var h = (b.val / max) * (H - pad - 28);
      if (b.val > 0 && h < 2) h = 2;
      var x = pad + i * bw, y = H - 28 - h;
      var lbl = (i % 2 === 0) ? '<text x="' + (x + bw / 2) + '" y="' + (H - 10) + '" text-anchor="middle">' + b.label + '</text>' : '';
      return '<rect class="bar" x="' + (x + 2) + '" y="' + y + '" width="' + (bw - 4) + '" height="' + h + '" rx="3"><title>' +
             esc(b.d.toLocaleDateString('es-CO')) + ': ' + money(b.val) + '</title></rect>' + lbl;
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '"><line class="axis" x1="' + pad + '" y1="' + (H - 28) + '" x2="' + (W - pad) + '" y2="' + (H - 28) + '"/>' + bars + '</svg>';
  }

  function topProducts() {
    var map = {};
    orders.forEach(function (o) {
      if (o.status === 'cancelado') return;
      (o.items || []).forEach(function (it) {
        var k = it.sku || it.name; if (!k) return;
        if (!map[k]) map[k] = { name: it.name || k, units: 0, rev: 0 };
        map[k].units += Number(it.qty) || 0;
        map[k].rev += (Number(it.price) || 0) * (Number(it.qty) || 0);
      });
    });
    var arr = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.units - a.units; }).slice(0, 5);
    if (!arr.length) return '<p class="empty" style="padding:24px">Aún no hay productos vendidos.</p>';
    var max = arr[0].units || 1;
    return arr.map(function (p, i) {
      return '<div class="rankrow"><div class="rankn">' + (i + 1) + '</div><div class="rankinfo">' +
        '<div class="nm">' + esc(p.name) + '</div><div class="meta">' + p.units + ' u · ' + money(p.rev) + '</div>' +
        '<div class="rankbar"><span style="width:' + ((p.units / max) * 100) + '%"></span></div></div></div>';
    }).join('');
  }

  function renderResumen() {
    var tkey = dayKey(Date.now()), ym = tkey.slice(0, 7);
    var confirmed = orders.filter(function (o) { return SOLD.indexOf(o.status) > -1; });
    var monthRev = confirmed.filter(function (o) { return dayKey(o.createdAtTs).slice(0, 7) === ym; })
      .reduce(function (a, o) { return a + (Number(o.total) || 0); }, 0);
    var sumConf = confirmed.reduce(function (a, o) { return a + (Number(o.total) || 0); }, 0);
    var ticket = confirmed.length ? Math.round(sumConf / confirmed.length) : 0;
    var today = orders.filter(function (o) { return dayKey(o.createdAtTs) === tkey; }).length;
    var compl = attempts.filter(function (a) { return a.status === 'completado'; }).length;
    var conv = attempts.length ? Math.round((compl / attempts.length) * 100) : null;
    var sinPagar = attempts.filter(function (a) { return a.status !== 'completado'; }).length;
    var cards = [
      ['Pedidos hoy', today, ''], ['Ventas del mes', money(monthRev), 'sm'],
      ['Ticket promedio', money(ticket), 'sm'], ['Conversión', conv == null ? '—' : conv + '%', ''],
      ['Carritos sin pagar', sinPagar, ''],
    ];
    var kpis = '<div class="stats">' + cards.map(function (c) {
      return '<div class="stat"><p class="k">' + c[0] + '</p><p class="v ' + c[2] + '">' + c[1] + '</p></div>';
    }).join('') + '</div>';
    el.view.innerHTML = kpis +
      '<div class="grid2">' +
        '<div class="section"><h3>Ventas por día <span class="sub">últimos 14 días</span></h3>' + salesChart() + '</div>' +
        '<div class="section"><h3>Productos más vendidos</h3>' + topProducts() + '</div>' +
      '</div>';
  }

  /* ---------- PEDIDOS ---------- */
  function filteredOrders() {
    var q = el.search.value.trim().toLowerCase(), fs = el.fStatus.value, fp = el.fPay.value;
    var from = el.fFrom.value ? new Date(el.fFrom.value + 'T00:00:00').getTime() : null;
    var to = el.fTo.value ? new Date(el.fTo.value + 'T23:59:59').getTime() : null;
    return orders.filter(function (o) {
      if (fs && o.status !== fs) return false;
      if (fp && o.payment !== fp) return false;
      if (from && (o.createdAtTs || 0) < from) return false;
      if (to && (o.createdAtTs || 0) > to) return false;
      if (q) { var c = o.customer || {}; if ([o.ref, c.name, c.phone, c.city].join(' ').toLowerCase().indexOf(q) === -1) return false; }
      return true;
    });
  }
  function renderOrders() {
    if (!orders.length) { el.view.innerHTML = '<div class="table-wrap"><div class="empty">Aún no hay pedidos. Cuando un cliente compre, aparecerá aquí.</div></div>'; return; }
    var list = filteredOrders();
    if (!list.length) { el.view.innerHTML = '<div class="table-wrap"><div class="empty">Ningún pedido coincide con el filtro.</div></div>'; return; }
    var rows = list.map(function (o) {
      var c = o.customer || {};
      return '<tr data-i="' + orders.indexOf(o) + '"' + (o.status === 'nuevo' ? ' class="is-new"' : '') + '>' +
        '<td data-l="Fecha">' + esc(when(o.createdAtTs)) + '</td>' +
        '<td data-l="Pedido"><span class="mono">' + esc(o.ref) + '</span></td>' +
        '<td data-l="Cliente">' + esc((c.name || '—')) + (o.adminNote ? ' 📝' : '') + '</td>' +
        '<td data-l="Teléfono">' + esc(c.phone || '—') + '</td>' +
        '<td data-l="Total" class="money">' + money(o.total) + '</td>' +
        '<td data-l="Pago"><span class="pay-tag">' + esc(PAY_NAMES[o.payment] || o.payment || '—') + '</span></td>' +
        '<td data-l="Estado">' + stPill(o.status) + '</td></tr>';
    }).join('');
    el.view.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
      '<th>Fecha</th><th>Pedido</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Pago</th><th>Estado</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    Array.prototype.forEach.call(el.view.querySelectorAll('tbody tr'), function (tr) {
      tr.addEventListener('click', function () { openOrder(orders[+tr.getAttribute('data-i')]); });
    });
  }

  /* ---------- INTENTOS ---------- */
  function filteredAttempts() {
    var f = el.fAttempt.value;
    return attempts.filter(function (a) {
      var st = a.status === 'completado' ? 'completado' : 'abierto';
      return !f || st === f;
    });
  }
  function renderAttempts() {
    if (!attempts.length) { el.view.innerHTML = '<div class="table-wrap"><div class="empty">Aún no hay intentos de carrito registrados.</div></div>'; return; }
    var list = filteredAttempts();
    if (!list.length) { el.view.innerHTML = '<div class="table-wrap"><div class="empty">Ningún intento coincide con el filtro.</div></div>'; return; }
    var rows = list.map(function (a) {
      var c = a.customer || {};
      var nItems = (a.items || []).reduce(function (s, it) { return s + (Number(it.qty) || 1); }, 0);
      var st = a.status === 'completado' ? 'completado' : 'abierto';
      return '<tr data-i="' + attempts.indexOf(a) + '">' +
        '<td data-l="Fecha">' + esc(when(a.createdAtTs)) + '</td>' +
        '<td data-l="Cliente">' + esc(c.name || '—') + '</td>' +
        '<td data-l="Teléfono">' + esc(c.phone || '—') + '</td>' +
        '<td data-l="Artículos">' + nItems + '</td>' +
        '<td data-l="Total" class="money">' + money(a.total) + '</td>' +
        '<td data-l="Estado"><span class="st st-' + st + '">' + (st === 'completado' ? 'Compró' : 'Sin pagar') + '</span></td></tr>';
    }).join('');
    el.view.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
      '<th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Artículos</th><th>Total</th><th>Estado</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    Array.prototype.forEach.call(el.view.querySelectorAll('tbody tr'), function (tr) {
      tr.addEventListener('click', function () { openAttempt(attempts[+tr.getAttribute('data-i')]); });
    });
  }

  /* ---------- CLIENTES ---------- */
  function renderClientes() {
    if (!orders.length) { el.view.innerHTML = '<div class="table-wrap"><div class="empty">Aún no hay clientes.</div></div>'; return; }
    var map = {};
    orders.forEach(function (o) {
      var c = o.customer || {}, key = c.phone || c.name || '—';
      if (!map[key]) map[key] = { name: c.name || '—', phone: c.phone || '', count: 0, spent: 0, last: 0 };
      var m = map[key];
      m.count++;
      if (o.status !== 'cancelado') m.spent += Number(o.total) || 0;
      if ((o.createdAtTs || 0) > m.last) m.last = o.createdAtTs;
      if (c.name && m.name === '—') m.name = c.name;
    });
    var arr = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.spent - a.spent; });
    var rows = arr.map(function (c) {
      var wa = (c.phone || '').replace(/\D/g, '');
      return '<tr>' +
        '<td data-l="Cliente">' + esc(c.name) + (c.count > 1 ? ' <span class="st st-completado">repite</span>' : '') + '</td>' +
        '<td data-l="Teléfono">' + (wa ? '<a href="https://wa.me/57' + wa + '" target="_blank" rel="noopener">' + esc(c.phone) + '</a>' : '—') + '</td>' +
        '<td data-l="Pedidos">' + c.count + '</td>' +
        '<td data-l="Gastado" class="money">' + money(c.spent) + '</td>' +
        '<td data-l="Último">' + esc(when(c.last)) + '</td></tr>';
    }).join('');
    el.view.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
      '<th>Cliente</th><th>Teléfono</th><th>Pedidos</th><th>Gastado</th><th>Último</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---------- Modales ---------- */
  function closeModal() { el.modal.classList.add('hidden'); el.modal.innerHTML = ''; }
  function bindClose() {
    var c1 = $('#mClose'), c2 = $('#mCloseFoot');
    if (c1) c1.addEventListener('click', closeModal);
    if (c2) c2.addEventListener('click', closeModal);
    el.modal.addEventListener('click', function (e) { if (e.target === el.modal) closeModal(); });
  }

  function openOrder(o) {
    if (!o) return;
    var c = o.customer || {};
    var loc = [c.city, c.department, o.country === 'CO' ? 'Colombia' : (o.country ? 'Otro país' : '')].filter(Boolean).join(', ');
    var items = (o.items || []).map(function (it) {
      return '<div class="it"><span>' + esc(it.name) + ' <span class="q">×' + (it.qty || 1) + '</span>' + (it.dropiId ? '<span class="dropi-ref">Dropi: ' + esc(it.dropiId) + '</span>' : '') + '</span><span>' + money((it.price || 0) * (it.qty || 1)) + '</span></div>';
    }).join('') || '<div class="it"><span class="q">Sin artículos</span></div>';
    var stateBtns = STATES.map(function (s) {
      var active = (o.status || 'nuevo') === s;
      return '<button class="btn" data-s="' + s + '"' + (active ? ' style="border-color:var(--accent);background:var(--card2)"' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
    }).join('');
    var waPhone = (c.phone || '').replace(/\D/g, '');
    var waHref = waPhone ? ('https://wa.me/57' + waPhone) : '';

    el.modal.innerHTML =
      '<div class="modal"><div class="modal-h"><h3>Pedido <span class="mono">' + esc(o.ref) + '</span></h3><button class="x" id="mClose">×</button></div>' +
      '<div class="modal-b">' +
        '<div class="kv">' +
          '<span class="k">Fecha</span><span>' + esc(when(o.createdAtTs)) + '</span>' +
          '<span class="k">Estado</span><span>' + stPill(o.status) + '</span>' +
          '<span class="k">Cliente</span><span>' + esc(c.name || '—') + '</span>' +
          '<span class="k">Teléfono</span><span>' + esc(c.phone || '—') + '</span>' +
          '<span class="k">Ubicación</span><span>' + esc(loc || '—') + '</span>' +
          '<span class="k">Dirección</span><span>' + esc(c.address || '—') + '</span>' +
          (c.notes ? '<span class="k">Notas cliente</span><span>' + esc(c.notes) + '</span>' : '') +
          '<span class="k">Pago</span><span>' + esc(PAY_NAMES[o.payment] || o.payment || '—') + '</span>' +
        '</div>' +
        '<div class="items-l">' + items +
          '<div class="it"><span class="q">Subtotal</span><span>' + money(o.subtotal) + '</span></div>' +
          '<div class="it"><span class="q">Envío</span><span>' + (o.shipping ? money(o.shipping) : 'Gratis') + '</span></div>' +
          '<div class="it"><span><b>Total</b></span><span class="money">' + money(o.total) + '</span></div>' +
        '</div>' +
        '<p class="k" style="color:var(--muted);font-size:12px;margin:0 0 8px">Cambiar estado</p>' +
        '<div class="status-row">' + stateBtns + '</div>' +
        '<p class="k" style="color:var(--muted);font-size:12px;margin:16px 0 8px">Nota interna</p>' +
        '<textarea class="note-box" id="mNote" placeholder="Escribe una nota para este pedido…">' + esc(o.adminNote || '') + '</textarea>' +
        '<p class="hint" id="mNoteHint"></p>' +
      '</div>' +
      '<div class="modal-foot">' +
        (waHref ? '<a class="btn" href="' + waHref + '" target="_blank" rel="noopener">💬 WhatsApp</a>' : '') +
        '<button class="btn" id="mSaveNote">💾 Guardar nota</button>' +
        '<button class="btn btn-danger" id="mDelete">🗑 Eliminar</button>' +
        '<button class="btn" id="mCloseFoot">Cerrar</button>' +
      '</div></div>';
    el.modal.classList.remove('hidden');
    bindClose();
    Array.prototype.forEach.call(el.modal.querySelectorAll('[data-s]'), function (b) {
      b.addEventListener('click', function () {
        db.collection('orders').doc(o._id).set({ status: b.getAttribute('data-s') }, { merge: true }).then(closeModal)
          .catch(function () { alert('No se pudo cambiar el estado.'); });
      });
    });
    $('#mSaveNote').addEventListener('click', function () {
      db.collection('orders').doc(o._id).set({ adminNote: $('#mNote').value }, { merge: true })
        .then(function () { $('#mNoteHint').textContent = 'Nota guardada ✓'; })
        .catch(function () { $('#mNoteHint').textContent = 'No se pudo guardar.'; });
    });
    $('#mDelete').addEventListener('click', function () {
      if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
      db.collection('orders').doc(o._id).delete().then(closeModal)
        .catch(function () { alert('No se pudo eliminar.'); });
    });
  }

  function openAttempt(a) {
    if (!a) return;
    var c = a.customer || {};
    var items = (a.items || []).map(function (it) {
      return '<div class="it"><span>' + esc(it.name) + ' <span class="q">×' + (it.qty || 1) + '</span>' + (it.dropiId ? '<span class="dropi-ref">Dropi: ' + esc(it.dropiId) + '</span>' : '') + '</span><span>' + money((it.price || 0) * (it.qty || 1)) + '</span></div>';
    }).join('') || '<div class="it"><span class="q">Sin artículos</span></div>';
    var waPhone = (c.phone || '').replace(/\D/g, '');
    el.modal.innerHTML =
      '<div class="modal"><div class="modal-h"><h3>Intento de carrito</h3><button class="x" id="mClose">×</button></div>' +
      '<div class="modal-b">' +
        '<div class="kv">' +
          '<span class="k">Fecha</span><span>' + esc(when(a.createdAtTs)) + '</span>' +
          '<span class="k">Estado</span><span>' + (a.status === 'completado' ? '<span class="st st-completado">Compró</span>' : '<span class="st st-abierto">Sin pagar</span>') + '</span>' +
          '<span class="k">Cliente</span><span>' + esc(c.name || '—') + '</span>' +
          '<span class="k">Teléfono</span><span>' + esc(c.phone || '—') + '</span>' +
        '</div>' +
        '<div class="items-l">' + items +
          '<div class="it"><span><b>Total</b></span><span class="money">' + money(a.total) + '</span></div>' +
        '</div>' +
        (a.status !== 'completado' && waPhone ? '<p class="hint">Tip: escríbele por WhatsApp para recuperar la venta.</p>' : '') +
      '</div>' +
      '<div class="modal-foot">' +
        (waPhone ? '<a class="btn" href="https://wa.me/57' + waPhone + '" target="_blank" rel="noopener">💬 WhatsApp</a>' : '') +
        '<button class="btn btn-danger" id="mDelete">🗑 Eliminar</button>' +
        '<button class="btn" id="mCloseFoot">Cerrar</button>' +
      '</div></div>';
    el.modal.classList.remove('hidden');
    bindClose();
    $('#mDelete').addEventListener('click', function () {
      if (!confirm('¿Eliminar este intento?')) return;
      db.collection('attempts').doc(a._id).delete().then(closeModal)
        .catch(function () { alert('No se pudo eliminar.'); });
    });
  }

  /* ---------- Exportar CSV ---------- */
  function downloadCSV(name, head, rows) {
    var csv = [head].concat(rows).map(function (r) {
      return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  el.exportBtn.addEventListener('click', function () {
    var list = filteredOrders();
    if (!list.length) return alert('No hay pedidos para exportar.');
    downloadCSV('mundo-smart-pedidos',
      ['Pedido', 'Fecha', 'Cliente', 'Telefono', 'Ciudad', 'Departamento', 'Pais', 'Pago', 'Estado', 'Subtotal', 'Envio', 'Total', 'Articulos', 'Nota'],
      list.map(function (o) {
        var c = o.customer || {};
        var its = (o.items || []).map(function (it) { return (it.qty || 1) + 'x ' + it.name; }).join(' | ');
        return [o.ref, when(o.createdAtTs), c.name, c.phone, c.city, c.department,
          o.country === 'CO' ? 'Colombia' : 'Otro', PAY_NAMES[o.payment] || o.payment, o.status,
          o.subtotal, o.shipping, o.total, its, o.adminNote || ''];
      }));
  });
  el.exportAtt.addEventListener('click', function () {
    var list = filteredAttempts();
    if (!list.length) return alert('No hay intentos para exportar.');
    downloadCSV('mundo-smart-intentos',
      ['Fecha', 'Cliente', 'Telefono', 'Articulos', 'Total', 'Estado'],
      list.map(function (a) {
        var c = a.customer || {};
        var its = (a.items || []).map(function (it) { return (it.qty || 1) + 'x ' + it.name; }).join(' | ');
        return [when(a.createdAtTs), c.name, c.phone, its, a.total, a.status === 'completado' ? 'Compró' : 'Sin pagar'];
      }));
  });
})();
