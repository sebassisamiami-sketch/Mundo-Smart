/*
 * db.js — Conexión de la TIENDA con Firestore.
 * Guarda cada pedido confirmado y cada intento de carrito, para que el panel
 * de administración (admin.html) pueda verlos.
 *
 * Es ADITIVO y a prueba de fallos: si Firebase no está configurado todavía
 * (firebase-config.js vacío) o no cargó, la tienda sigue funcionando igual
 * y estas funciones simplemente no hacen nada.
 */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var db = null;
  var ready = false;

  function init() {
    if (ready) return true;
    if (!cfg.projectId || !cfg.apiKey) return false;      // aún sin configurar
    if (!window.firebase || !firebase.firestore) return false; // SDK no cargó
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.firestore();
      ready = true;
    } catch (e) {
      ready = false;
    }
    return ready;
  }

  // Normaliza un pedido para guardarlo (quita funciones, deja datos planos).
  function clean(o) {
    try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; }
  }

  window.DB = {
    get enabled() { return init(); },

    // Guarda un pedido confirmado. Devuelve Promise<bool>.
    saveOrder: function (order) {
      if (!init()) return Promise.resolve(false);
      var ref = (order && order.ref) ? String(order.ref) : ('MS-' + Date.now());
      var data = clean(order) || {};
      data.status = data.status || 'nuevo';
      data.createdAtTs = Date.now();
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      return db.collection('orders').doc(ref).set(data)
        .then(function () { return true; })
        .catch(function () { return false; });
    },

    // Registra un intento de carrito / checkout (cliente abrió el pago).
    // Devuelve el id del intento (para marcarlo completado luego) o null.
    logAttempt: function (payload) {
      if (!init()) return Promise.resolve(null);
      var data = clean(payload) || {};
      data.createdAtTs = Date.now();
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      data.status = 'abierto';
      return db.collection('attempts').add(data)
        .then(function (r) { return r.id; })
        .catch(function () { return null; });
    },

    // Marca un intento como completado (cuando el pedido sí se confirmó).
    completeAttempt: function (id, ref) {
      if (!init() || !id) return Promise.resolve(false);
      return db.collection('attempts').doc(id)
        .set({ status: 'completado', orderRef: ref || null,
               completedAtTs: Date.now() }, { merge: true })
        .then(function () { return true; })
        .catch(function () { return false; });
    },
  };
})();
