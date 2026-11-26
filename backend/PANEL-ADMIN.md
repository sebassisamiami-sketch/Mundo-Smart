# Panel de administración — Mundo Smart

Página: `admin.html` (independiente de la tienda). Ejemplo cuando publiques:
`https://mundo-smart-tienda.web.app/admin.html`

## Qué hace
- Entra **solo** con tu cuenta de Google `sebastian.sisatravel@gmail.com`.
- Pide **verificación en 2 pasos** (la exige Google al iniciar sesión).
- La **sesión se cierra sola a las 6 horas**.
- **Pedidos**: lista en tiempo real, buscar, filtrar por estado y pago, ver detalle,
  cambiar estado (Nuevo → Confirmado → Despachado → Entregado / Cancelado),
  escribir al cliente por WhatsApp y **exportar a CSV**.
- **Intentos de carrito**: quién llegó a pagar y no terminó (carritos sin pagar).
- **Estadísticas**: total de pedidos, ventas confirmadas, nuevos por revisar, carritos sin pagar.

---

## Configuración (una sola vez, ~10 min)

### 1) Crear la app web y copiar la configuración
Firebase Console → ⚙️ **Configuración del proyecto** → sección **Tus apps** →
si no tienes app web, crea una (ícono `</>`). Copia el objeto `firebaseConfig`
y pégalo en **`js/firebase-config.js`** (son valores públicos, es seguro).

### 2) Activar Firestore
Console → **Firestore Database** → **Crear base de datos** → modo **production** →
elige la región (p. ej. `nam5` o `us-east1`).

### 3) Publicar las reglas de seguridad
Console → Firestore → pestaña **Reglas** → pega el contenido de
**`backend/firestore.rules`** → **Publicar**. (Ahí está tu correo autorizado.)

### 4) Activar el inicio de sesión con Google
Console → **Authentication** → **Comenzar** → pestaña **Sign-in method** →
habilita **Google** → guarda.
En **Authentication → Settings → Dominios autorizados**, confirma que esté
`mundo-smart-tienda.web.app` (Firebase Hosting lo agrega solo).

### 5) Activar tu 2FA (la doble autenticación)
En tu cuenta de Google `sebastian.sisatravel@gmail.com`:
`myaccount.google.com/security` → **Verificación en 2 pasos** → actívala
(app Google, llave o SMS). Como el panel entra con Google, esto es lo que
obliga el segundo factor al iniciar sesión.

### 6) Publicar
`git pull` (o sube los archivos) y `firebase deploy`.
Entra a `…/admin.html`, inicia con Google y listo.

---

## Notas
- La tienda sigue funcionando aunque Firebase no esté configurado todavía:
  simplemente no guarda pedidos hasta que pegues la config.
- Los pedidos se guardan al confirmarlos (contra entrega o pago en Wompi).
- El panel no expone datos aunque sea una URL pública: las **reglas de
  Firestore** solo dejan leer a tu correo.
