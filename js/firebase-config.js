/*
 * Configuración de Firebase (para guardar pedidos y para el panel de administración).
 *
 * Pega aquí la config web de tu proyecto de Firebase:
 *   Firebase Console → ⚙ Configuración del proyecto → "Tus apps" → (app web) → SDK/Config.
 *
 * TODOS estos valores son PÚBLICOS (van en el frontend, es seguro). La seguridad real
 * la dan las reglas de Firestore y el login con Google (ver backend/firestore.rules).
 */
window.FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Único correo autorizado para entrar al panel de administración.
window.ADMIN_EMAIL = 'sebastian.sisatravel@gmail.com';

// La sesión del panel se cierra sola pasadas estas horas.
window.ADMIN_SESSION_HOURS = 6;
