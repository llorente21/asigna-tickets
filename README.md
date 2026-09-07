# ASIGNA — Sistema de Tickets (para Oficinas Felices)

App de una sola página (HTML + Firebase Firestore) para reportar y dar seguimiento a
incidencias. **ASIGNA** es el nombre/marca propia de esta aplicación — su primer
despliegue es para la Red de Oficinas Felices (locaciones D1–D4), pero está pensada como
producto con identidad propia. Instalable como PWA en celular. Sin frameworks, sin
build — se edita `index.html` y se sube tal cual.

## Estado actual

✅ Interfaz completa y probada (login, roles, CRUD de tickets, notificaciones in-app,
dashboard, gestión de usuarios, PWA).
✅ **Funciones de help desk añadidas:** cualquier rol puede crear tickets (Admin y
Empleado eligen "reportado por" para registrar a nombre de un locatario — útil para
reportes telefónicos); hilo de comentarios en cada ticket; opción de reabrir un ticket
cerrado si el problema persiste; indicador de "Vencido" según SLA por
prioridad (alta 2d / media 5d / baja 10d) con KPI en el Dashboard; exportación de
tickets a CSV.
✅ **Flujo de estatus simplificado (2026-09-01):** el flujo pasó de 5 pasos a 3 —
**Nuevo → En proceso → Cerrado**. Se quitaron "En revisión" y "Resuelto", y con ellos
la evaluación de conformidad del locatario (1-5 estrellas) — ya no existe ese paso ni
esa métrica en el Dashboard/CSV. Reabrir un ticket cerrado ahora lo regresa a "En
proceso" directamente (antes iba a "En revisión").
✅ **Tres roles:** Administrador, Empleado (staff interno) y Locatario (inquilino) — ver
detalle en la sección 4.
✅ **Rebrand a ASIGNA aplicado** — header, splash, login, título de pestaña, `manifest.json`
e ícono de la app ya dicen ASIGNA en vez de "Oficinas Felices". Las categorías de
incidencia y las locaciones D1–D4 (específicas de Oficinas Felices) se mantienen igual.
✅ **Logo e identidad visual final** — se reemplazó el ícono generado por el logotipo
real ("asigna" en minúsculas + destello, `logo-hero.jpg`) y se ajustó el color de acento
en toda la app (`--accent`) al amarillo exacto del logo (`#E0C01A`), extraído por
muestreo de píxeles. `icon-192.png`/`icon-512.png` son un recorte cuadrado ajustado del
mismo logo para favicon/PWA.
✅ **Panel de escritorio con sidebar** — en pantallas ≥1024px, Administrador y Empleado
ven un panel tipo escritorio (sidebar de navegación + topbar + contenido), con secciones
nuevas: **Usuarios** (las 3 cuentas: Administrador, Empleado y Locatario, todas juntas —
cada locatario muestra su empresa en su tarjeta), **Empresas** (catálogo de compañías
clientes, sin personas — formulario con nombre, oficina/locación y teléfono; vista de
tarjetas o lista), **Áreas** (categorías de incidencia — nombre + subcategorías,
editables desde un formulario igual que Empresas/Usuarios), **Estados** y
**Prioridades** (estas dos siguen de solo lectura por ahora — el cambio a catálogos
editables queda para una siguiente iteración) y **Configuración** (política de SLA,
locaciones, acerca de). Los Locatarios y cualquier pantalla angosta (<1024px) siguen con
la experiencia móvil original (header + tarjetas + navegación inferior + botón +). El
cambio de layout es automático según rol + ancho de pantalla, sin recargar la página.
✅ **Firebase conectado** — proyecto `asigna-feliz` (creado en una cuenta de Google
separada, para no mezclar datos con MANGA). `FIREBASE_CONFIG` en `index.html` ya tiene
las credenciales reales y se verificó que los tickets/usuarios se guardan de verdad en
Firestore (no solo en el navegador).
✅ **Reglas de Firestore cerradas** (ver sección 3) — ya no están en modo prueba abierto.
✅ **En producción:** [https://llorente21.github.io/asigna-tickets/](https://llorente21.github.io/asigna-tickets/)
(repo: [github.com/llorente21/asigna-tickets](https://github.com/llorente21/asigna-tickets)) — probado en desktop y móvil, login real contra Firebase confirmado.

## 1. Proyecto de Firebase (ya hecho)

El proyecto vive en una cuenta de Google distinta a la de MANGA, para mantenerlos
separados. Datos de referencia (no hace falta repetir este paso):

- Proyecto: `asigna-feliz`
- Colecciones en Firestore: `tickets`, `usuarios`, `notificaciones`, `empresas`, `categorias`

Si en algún momento hay que recrear la conexión (otro proyecto, otra cuenta), los pasos
generales son: [console.firebase.google.com](https://console.firebase.google.com) →
Agregar proyecto → Compilación → Firestore Database → Crear base de datos (modo prueba)
→ ⚙️ Configuración del proyecto → Tus apps → `</>` (Web) → copiar `apiKey` y `projectId`.

## 2. Conectar la app (ya hecho)

`FIREBASE_CONFIG` en `index.html` ya apunta al proyecto real:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAyOlbLEpuOyJByVOuHCVKW5Wzf5w8DMIc",
  projectId: "asigna-feliz",
};
```

## 3. Reglas de Firestore

### 3.1 — Reglas activas en producción (2026-09)

**Estado: ya publicadas y probadas con las 3 cuentas de rol (Admin, Empleado,
Locatario) en producción**, incluyendo seguridad por fila de `tickets`/
`notificaciones` y auto-registro de Locatario con aprobación (Fase 3). Ver
`Plan/01-ARQUITECTURA.md` para el detalle de cada mecanismo.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function tieneClaves(d, claves) {
      return d.keys().hasAll(claves);
    }
    function autenticado() {
      return request.auth != null && request.auth.token.email != null;
    }
    function miEmail() {
      return request.auth.token.email.lower();
    }
    function miPerfilExiste() {
      return exists(/databases/$(database)/documents/usuarios/$(miEmail()));
    }
    function miPerfil() {
      return get(/databases/$(database)/documents/usuarios/$(miEmail())).data;
    }
    function soyStaff() {
      return autenticado() && miPerfilExiste() && miPerfil().role in ['admin','empleado'];
    }
    function soyAdmin() {
      return autenticado() && miPerfilExiste() && miPerfil().role == 'admin';
    }
    // Cuentas creadas por Admin/Empleado no tienen el campo 'aprobado' — se
    // tratan como aprobadas (get con default true). Solo el auto-registro
    // (Fase 3) escribe 'aprobado: false' explícito.
    function miPerfilAprobado() {
      return miPerfilExiste() && miPerfil().get('aprobado', true) != false;
    }
    function autorizado() {
      return autenticado() && (soyStaff() || miPerfilAprobado());
    }

    match /usuarios/{email} {
      allow get: if autenticado() && (miEmail() == email || soyStaff());
      allow list: if soyStaff();
      // Admin puede crear/editar cualquier cuenta. Empleado solo puede crear/editar
      // cuentas de Locatario — nunca Admin/Empleado, ni para sí mismo ni para otros.
      allow create: if tieneClaves(request.resource.data, ['email','name','password','role'])
                   && request.resource.data.role in ['admin','empleado','locatario']
                   && request.resource.data.email is string
                   && request.resource.data.name is string
                   && request.resource.data.password is string
                   && (
                        soyAdmin()
                        || (autenticado() && miPerfilExiste() && miPerfil().role == 'empleado'
                            && request.resource.data.role == 'locatario')
                        // Auto-registro: una persona autenticada (recién creada en
                        // Firebase Authentication) sin perfil todavía puede crear
                        // SU PROPIO documento, únicamente como Locatario y
                        // únicamente marcado como no aprobado.
                        || (autenticado() && !miPerfilExiste() && miEmail() == email
                            && request.resource.data.role == 'locatario'
                            && request.resource.data.aprobado == false)
                      );
      allow update: if tieneClaves(request.resource.data, ['email','name','password','role'])
                   && request.resource.data.role in ['admin','empleado','locatario']
                   && request.resource.data.email is string
                   && request.resource.data.name is string
                   && request.resource.data.password is string
                   && (
                        soyAdmin()
                        || (autenticado() && miPerfilExiste() && miPerfil().role == 'empleado'
                            && request.resource.data.role == 'locatario')
                      );
      allow delete: if soyAdmin();
    }

    match /tickets/{ticketId} {
      // "empleado_email" guarda, pese al nombre heredado, el correo de quien
      // REPORTÓ el ticket (el Locatario) — no el del responsable asignado.
      // Se exige "autorizado()" (no solo "autenticado()") para que un Locatario
      // pendiente de aprobación no pueda crear ni leer tickets todavía.
      allow get: if soyStaff() || (autorizado() && resource.data.empleado_email == miEmail());
      allow list: if soyStaff() || (autorizado() && resource.data.empleado_email == miEmail());
      allow create: if autorizado() && tieneClaves(request.resource.data,
                      ['id','numero','empleado_email','locacion','categoria','descripcion','status','historial'])
                   && request.resource.data.status == 'nuevo';
      allow update: if soyStaff() || (autorizado() && resource.data.empleado_email == miEmail());
      allow delete: if soyAdmin();
    }

    match /notificaciones/{notifId} {
      // "get"/"list" sí exigen estar aprobado (un pendiente no tiene pantalla de
      // notificaciones). "create"/"update" se quedan en "autenticado()" a propósito:
      // una persona recién auto-registrada (todavía sin aprobar) necesita poder
      // crear la notificación que avisa a "staff" de su propia solicitud.
      allow get: if soyStaff() || (autorizado() && resource.data.para == miEmail());
      allow list: if soyStaff() || (autorizado() && resource.data.para == miEmail());
      allow create, update: if autenticado() && tieneClaves(request.resource.data, ['id','para','tipo','mensaje','fecha','leida']);
      allow delete: if autenticado();
    }

    match /empresas/{empresaId} {
      allow read: if autenticado();
      allow create, update: if autenticado() && tieneClaves(request.resource.data, ['id','nombre']);
      allow delete: if soyAdmin();
    }

    match /categorias/{categoriaId} {
      allow read: if autenticado();
      allow create, update: if autenticado() && tieneClaves(request.resource.data, ['id','nombre']);
      allow delete: if soyAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Lo que estas reglas nuevas resuelven:** permiten el auto-registro de
Locatarios sin abrir ningún hueco de seguridad nuevo — una cuenta pendiente de
aprobación queda con acceso de solo lectura a su propio perfil (para ver la
pantalla de espera) y puede avisarle a staff que existe, pero no puede tocar
tickets de nadie, ni siquiera crear uno propio, hasta que un Admin/Empleado la
apruebe.

### 3.2 — Reglas históricas (reemplazadas por las de 3.1, antes de Firebase Authentication)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function tieneClaves(d, claves) {
      return d.keys().hasAll(claves);
    }

    match /usuarios/{email} {
      allow read: if true;
      allow create, update: if tieneClaves(request.resource.data, ['email','name','password','role'])
                   && request.resource.data.role in ['admin','empleado','locatario']
                   && request.resource.data.email is string
                   && request.resource.data.name is string
                   && request.resource.data.password is string;
      allow delete: if true;
    }

    match /tickets/{ticketId} {
      allow read: if true;
      allow create: if tieneClaves(request.resource.data,
                      ['id','numero','empleado_email','locacion','categoria','descripcion','status','historial'])
                   && request.resource.data.status == 'nuevo';
      allow update: if request.resource.data.status in
                      ['nuevo','en_revision','en_proceso','resuelto','cerrado'];
      allow delete: if true;
    }

    match /notificaciones/{notifId} {
      allow read: if true;
      allow create, update: if tieneClaves(request.resource.data, ['id','para','tipo','mensaje','fecha','leida']);
      allow delete: if true;
    }

    match /empresas/{empresaId} {
      allow read: if true;
      allow create, update: if tieneClaves(request.resource.data, ['id','nombre']);
      allow delete: if true;
    }

    match /categorias/{categoriaId} {
      allow read: if true;
      allow create, update: if tieneClaves(request.resource.data, ['id','nombre']);
      allow delete: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

⚠️ **Límite real de estas reglas (3.3, ya reemplazadas):** como no verificaban
identidad, cualquiera con la `apiKey` (pública, va en el código) podía leer la lista
de usuarios (incluidas las contraseñas en texto plano) y crear tickets con datos
válidos. Esa es exactamente la brecha que cerraron las reglas de 3.1, ya activas.

## 4. Primer ingreso

Usuario administrador por defecto (créalo o cámbialo desde la pantalla **Usuarios**
apenas entres):

```
Correo:      admin@oficinasfelices.com
Contraseña:  OficinasFelices2026
```

Desde **Usuarios** el admin crea el resto de las cuentas. No hay auto-registro: el
acceso siempre lo otorga la administración.

### Roles

- **Administrador** — control total: tickets, usuarios y Dashboard.
- **Empleado** — staff interno que asiste a la administración; ve y gestiona todos los
  tickets (cualquier locación), comenta, actualiza estatus, crea tickets a nombre de un
  locatario. No puede gestionar usuarios, no puede eliminar tickets, no ve el Dashboard.
- **Locatario** — inquilino que reporta incidencias de su oficina (D1–D4) y da
  seguimiento a sus propios tickets.

## 5. Deploy en GitHub Pages

1. Crea un repositorio en GitHub (público o privado).
2. Sube `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` (no
   subas `_devserver.cjs`, es solo para probar en tu máquina).
3. **Settings → Pages → Deploy from branch → main / (root)**.
4. La URL quedará como `https://usuario.github.io/nombre-repo/`.
5. Para actualizar: edita `index.html` en GitHub (lápiz ✏️) o vuelve a subir el
   archivo — el sitio se actualiza solo en ~1 minuto.

### Instalar en el celular
- **Android/Chrome:** menú ⋮ → "Añadir a pantalla de inicio".
- **iPhone/Safari:** botón compartir → "Añadir a pantalla de inicio".

## 6. Probar localmente antes de subir (opcional)

```bash
node _devserver.cjs
```

y abre `http://localhost:5183` — sirve la carpeta tal cual la vería GitHub Pages
(esto evita el problema de `localStorage` bloqueado que da abrir el HTML como
`file://` directo).

## Resumen del flujo de negocio

1. El locatario inicia sesión (cuenta creada por administración, asociada a su locación D1–D4).
   Administración y Empleado también pueden crear un ticket a nombre de un locatario (ej. reporte telefónico).
2. Crea un ticket: categoría/subcategoría de incidencia + descripción (+ marcar urgente).
3. Se generan notificaciones in-app: una para el equipo (Admin + Empleado), una de confirmación para el locatario.
4. Administración o Empleado revisan, actualizan estatus (Nuevo → En proceso → Cerrado),
   asignan responsable y prioridad, y pueden comentar en el ticket — cada cambio queda en el historial con fecha,
   y se notifica al locatario en cada cambio de estatus.
5. Si el problema persiste, cualquiera de los dos (Admin/Empleado o el locatario dueño del ticket) puede reabrir
   un ticket ya cerrado — vuelve a "En proceso" y administración lo retoma.
6. El Dashboard (solo Administrador) muestra: tickets por categoría, por locación, distribución por estatus,
   promedio de días de solución (general y por categoría) y tendencia mensual.

## Categorías de incidencia (Áreas)

Editables desde **Áreas** en el panel de administración (nombre + subcategorías
opcionales). Por defecto la app siembra estas 7 la primera vez que se conecta a un
proyecto de Firebase nuevo:

- Aires Acondicionados → No enciende / No enfría
- Internet → No navega / No hay señal
- Limpieza
- Valet Parking
- Puertas, llavines y ventanas
- Luces
- Incidencias de agua → Filtración / Lluvias

## Locaciones

D1–D4 corresponden a DIX Business Center 1–4 (Red de Oficinas Felices).
