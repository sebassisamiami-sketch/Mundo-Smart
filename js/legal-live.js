/*
 * legal-live.js — Muestra en las páginas de Términos/Privacidad el texto que el
 * administrador haya guardado desde el panel (colección site/legal).
 * Si no hay texto guardado, la página conserva su contenido fijo (respaldo).
 */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var key = document.body.getAttribute('data-legal');
  var body = document.getElementById('legalBody');
  if (!key || !body) return;
  if (!cfg.projectId || !cfg.apiKey || !window.firebase || !firebase.firestore) return;
  var db;
  try { if (!firebase.apps.length) firebase.initializeApp(cfg); db = firebase.firestore(); }
  catch (e) { return; }
  db.collection('site').doc('legal').get().then(function (doc) {
    if (!doc || !doc.exists) return;
    var md = (doc.data() || {})[key];
    if (md && md.trim() && window.LEGAL && window.LEGAL.render) {
      body.innerHTML = window.LEGAL.render(md);
    }
  }).catch(function () {});
})();
