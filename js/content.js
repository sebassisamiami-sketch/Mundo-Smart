/*
 * content.js — Hace que la TIENDA lea su contenido EN VIVO desde Firestore.
 *
 * Si el administrador edita productos, categorías o ajustes en el panel, esos
 * cambios se guardan en Firestore (colección "site") y aquí se aplican al instante,
 * sin recargar y sin volver a publicar la página.
 *
 * Es ADITIVO y a prueba de fallos: si Firebase no está, o aún no hay contenido
 * guardado, la tienda sigue mostrando el catálogo de products.js como respaldo.
 */
(function () {
  'use strict';
  var cfg = window.FIREBASE_CONFIG || {};
  if (!cfg.projectId || !cfg.apiKey) return;
  if (!window.firebase || !firebase.firestore) return;

  var db;
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    db = firebase.firestore();
  } catch (e) { return; }

  var content = { products: null, categories: null, config: null };
  function apply() { if (typeof window.__MS_APPLY === 'function') window.__MS_APPLY(content); }

  // Catálogo (productos + categorías)
  db.collection('site').doc('catalog').onSnapshot(function (doc) {
    if (!doc || !doc.exists) return;
    var d = doc.data() || {};
    if (Array.isArray(d.products)) content.products = d.products;
    if (Array.isArray(d.categories)) content.categories = d.categories;
    apply();
  }, function () {});

  // Ajustes de la tienda (nombre, whatsapp, envío, garantía…)
  db.collection('site').doc('config').onSnapshot(function (doc) {
    if (!doc || !doc.exists) return;
    content.config = doc.data() || {};
    apply();
  }, function () {});
})();
