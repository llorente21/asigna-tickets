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
resuelto o cerrado si el problema persiste; indicador de "Vencido" según SLA por
prioridad (alta 2d / media 5d / baja 10d) con KPI en el Dashboard; exportación de
tickets a CSV.
✅ **Tres roles:** Administrador, Empleado (staff interno) y Locatario (inquilino) — ver
detalle en la sección 4.
✅ **Rebrand a ASIGNA aplicado** — header, splash, login, título de pestaña, `manifest.json`
e ícono de la app (monograma "A") ya dicen ASIGNA en vez de "Oficinas Felices". Las
categorías de incidencia y las locaciones D1–D4 (específicas de Oficinas Felices) se
mantienen igual.
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
- Colecciones en Firestore: `tickets`, `usuarios`, `notificaciones`

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

## 3. Reglas de Firestore (ya aplicadas)

Las reglas activas en el proyecto ya no están en modo prueba abierto — validan la forma
de los datos y restringen la escritura a las 3 colecciones que usa la app (`usuarios`,
`tickets`, `notificaciones`), bloqueando cualquier otra ruta:

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

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

⚠️ **Límite real de estas reglas:** como el login de la app es "casero" (usuario/
contraseña en Firestore, no Firebase Authentication), las reglas no pueden verificar
*quién* hace la petición — solo validan la *forma* de los datos. Cualquiera con la
`apiKey` (pública, va en el código) puede leer la lista de usuarios (incluidas las
contraseñas en texto plano) y crear tickets con datos válidos. Es la misma limitación
que tiene MANGA hoy y la misma tarea que sigue pendiente en `firestore.rules` de
LogiTrack Pro. Protección real por rol requeriría agregar Firebase Authentication a la
app — es una mejora aparte, no bloqueante para el uso normal interno.

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
4. Administración o Empleado revisan, actualizan estatus (Nuevo → En revisión → En proceso → Resuelto → Cerrado),
   asignan responsable y prioridad, y pueden comentar en el ticket — cada cambio queda en el historial con fecha.
5. Al marcar "Resuelto", se notifica al locatario.
6. El locatario confirma recepción y califica su conformidad (1–5 estrellas + comentario) — esto cierra el ticket,
   o reabre el ticket si el problema persiste (también disponible desde un ticket ya cerrado).
7. El Dashboard (solo Administrador) muestra: tickets por categoría, por locación, distribución por estatus,
   promedio de días de solución (general y por categoría), tendencia mensual y satisfacción promedio.

## Categorías de incidencia

- Aires Acondicionados → No enciende / No enfría
- Internet → No navega / No hay señal
- Limpieza
- Valet Parking
- Puertas, llavines y ventanas
- Luces
- Incidencias de agua → Filtración / Lluvias

## Locaciones

D1–D4 corresponden a DIX Business Center 1–4 (Red de Oficinas Felices).
