# Arquitectura técnica — ASIGNA

## Filosofía
Aplicación de una sola página, sin frameworks ni build. Todo vive en `index.html`
(HTML + CSS + JS inline). Se edita el archivo directo y se sube tal cual — no hay
`npm install`, no hay bundler, no hay paso de compilación. Esta simplicidad es
deliberada: mantenerla es un requisito de diseño, no una limitación temporal.

## Archivos del repo (raíz de `oficinas-felices-tickets/`)
- `index.html` — la app completa (HTML + CSS + JS).
- `manifest.json` — manifest de PWA.
- `sw.js` — service worker, estrategia **network-first** con `cache: 'no-store'`
  (evita servir versiones viejas del `index.html` después de un deploy — ver
  lección aprendida en `05-ESTANDARES.md`).
- `icon-192.png` / `icon-512.png` — íconos PWA (recorte cuadrado del logo).
- `logo-hero.jpg` — logo real de ASIGNA.
- `_devserver.cjs` — servidor local para pruebas (no se sube a producción, ver
  `.gitignore`... revisar si aplica).
- `README.md` — documentación orientada al usuario/dueño del proyecto.
- `design/` — mockups y direcciones visuales producidos en Claude Design (no
  dependen de Firebase ni del código real; datos de ejemplo).
- `Plan/` — esta carpeta.

## Backend: Firebase Firestore vía REST API
- **No se usa el SDK de Firebase** — se accede vía REST API directo, para evitar
  problemas de CORS que da el SDK en ciertos contextos.
- Proyecto: `asigna-feliz` (cuenta de Google separada de otros proyectos como MANGA,
  para no mezclar datos).
- Config en `index.html`:
  ```js
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAyOlbLEpuOyJByVOuHCVKW5Wzf5w8DMIc",
    projectId: "asigna-feliz",
  };
  ```
- Colecciones activas: `tickets`, `usuarios`, `notificaciones`, `empresas`,
  `categorias`.
- **Reglas de Firestore** (ver detalle completo en `README.md` raíz, sección 3):
  validan la *forma* de los datos por colección, restringen escritura a las 5
  colecciones en uso, bloquean cualquier otra ruta (`{document=**}` → false).
  - **Limitación conocida y aceptada:** el login es "casero" (usuario/contraseña en
    Firestore, colección `usuarios`), **no usa Firebase Authentication** — por lo
    tanto las reglas no pueden verificar *quién* hace la petición, solo la forma de
    los datos. Cualquiera con el `apiKey` (público, va en el código) puede leer la
    lista de usuarios (incluidas contraseñas en texto plano) y crear tickets válidos.
    Protección real por rol requeriría agregar Firebase Authentication — mejora
    aparte, no bloqueante para uso interno.
- **Colección nueva:** si una tarea necesita una colección nueva, sus
  lecturas/escrituras estarán bloqueadas por las reglas hasta que el usuario las
  publique manualmente en la consola de Firebase (el agente no tiene acceso a esa
  consola). Dar el texto exacto de la regla nueva para que la pegue, y aislar esa
  petición nueva en su propio try/catch para que un 403 mientras tanto no rompa la
  sincronización del resto de la app.
- **Antes de borrar cualquier documento real:** volver a consultar su ID fresco vía
  curl/REST inmediatamente antes de borrar — nunca reutilizar un ID visto antes en la
  conversación (puede haber cambiado).

## Autenticación de usuarios (actualizado 2026-09, en migración)

**Estado: código desplegado, reglas de Firestore nuevas aún pendientes de pegar por
Jose.** Ver `Plan/06-BRIEF-Y-PROMPT-REVISION-2026-09.md` para el plan completo y
`README.md` sección 3 para el texto exacto de las reglas (viejas y nuevas).

ASIGNA migró de comparar contraseñas en texto plano en Firestore a **Firebase
Authentication** (REST, sin SDK — mismo criterio que el resto de la app), sin
backend propio y sin romper el acceso de las cuentas ya existentes:

- **Login:** `index.html` llama a `accounts:signInWithPassword` (Identity Toolkit
  REST). Si falla (cuenta aún no migrada, o contraseña incorrecta), compara contra
  el campo `password` heredado en el doc `usuarios/{email}` de Firestore — si
  coincide, crea la cuenta en Firebase Authentication en ese momento con
  `accounts:signUp` ("migración perezosa": cada cuenta se migra sola, una sola vez,
  la primera vez que inicia sesión con este código). Si ninguna de las dos
  coincide, se rechaza el login.
- **Token de sesión:** tras autenticar, se guarda `idToken`/`refreshToken` en
  `localStorage` (`of_auth`) y se renueva automáticamente contra
  `securetoken.googleapis.com` cuando está por expirar. Todas las llamadas REST a
  Firestore (`fbGet`/`fbGetOne`/`fbSet`/`fbDelete`) mandan
  `Authorization: Bearer <idToken>` — esto es lo que permite que las reglas de
  Firestore nuevas (sección 3.1 del README) verifiquen *quién* hace la petición,
  no solo la forma de los datos.
- **Perfil (rol, nombre, locación, empresa):** ya no se descarga la colección
  `usuarios` completa para hacer login ni para que un Locatario use la app — se lee
  un solo documento (`fbGetOne('usuarios', email)`). Solo Admin/Empleado (staff)
  siguen descargando la colección completa, porque la necesitan para la sección
  Usuarios y para el selector de "reportado por" al crear un ticket a nombre de un
  Locatario.
- **Alta de usuarios:** al crear un usuario nuevo desde **Usuarios**, además de
  guardar el documento en Firestore se crea su cuenta en Firebase Authentication
  (`accounts:signUp`) con la contraseña ingresada en el formulario.
- **Cambiar la contraseña de un usuario existente:** ya NO se puede fijar
  directamente desde el formulario de Usuarios (fijar la contraseña de *otra*
  persona sin conocer la actual requiere privilegios de administrador de Firebase
  que esta app no tiene, al no correr un backend/Admin SDK). En su lugar, el
  formulario ofrece "Enviar enlace para restablecer contraseña"
  (`accounts:sendOobCode`), que manda un correo de Firebase para que la persona
  elija su propia contraseña nueva.
- **Eliminar un usuario:** borra el documento de Firestore (revoca el acceso a la
  app de inmediato, porque todas las reglas dependen de que ese documento exista),
  pero **no** puede borrar la cuenta de Firebase Authentication asociada (misma
  limitación de privilegios) — queda huérfana, sin ningún acceso a datos, ya que
  ninguna regla se satisface sin el documento de perfil. Aceptado como residual, no
  es un hueco de seguridad.
- **Empleado gestionando perfiles de Locatario:** el formulario de Usuarios permite
  a un Empleado crear/editar cuentas de rol `locatario` únicamente — el selector de
  rol bloquea `admin`/`empleado` para ese caso, y cualquier cuenta que no sea
  Locatario se muestra en modo solo lectura si un Empleado la abre. Reforzado
  también en las reglas de Firestore (sección 3.1 del README), no solo en la UI.
- **Restaurar sesión al recargar la página:** antes de reingresar automáticamente
  con la sesión guardada, se valida que el token siga siendo renovable — si no, se
  limpia la sesión guardada y se pide iniciar sesión de nuevo (evita una app que
  parece funcionar pero en realidad no puede leer nada por falta de token válido).

**Seguridad por fila (2026-09, código listo — reglas pendientes de pegar):**
para `tickets`/`notificaciones`, un Locatario ya no usa `fbGet` (lista TODA la
colección) — usa `fbQuery(collection, campo, valor)`, que llama al endpoint de
consultas estructuradas de Firestore (`:runQuery`) con un filtro de igualdad
(`empleado_email` en tickets — el campo que guarda, pese al nombre heredado, el
correo de quien REPORTÓ el ticket, no el del responsable asignado — y `para` en
notificaciones). Las reglas nuevas (README.md sección 3.2) separan `get`/`list` de
`tickets`/`notificaciones` en `soyStaff() || resource.data.<campo> == miEmail()` —
Firestore verifica que el `where` de la consulta coincida con esa condición antes de
permitir el `list`; si el cliente pidiera la colección sin ese filtro, la regla la
rechaza entera. Staff (admin/empleado) sigue usando `fbGet` sin filtrar, permitido
por `soyStaff()`. Empresas y Categorías quedan fuera de este cambio (catálogos de
referencia, no confidenciales por tenant).

## PWA
- `manifest.json` + `sw.js`.
- El service worker usa network-first con `cache: 'no-store'` específicamente para
  evitar el problema de caché viciada tras un deploy (ver commit `4f42058` y lección
  aprendida en `05-ESTANDARES.md`).
- Instalable en Android (Chrome → "Añadir a pantalla de inicio") e iOS (Safari →
  compartir → "Añadir a pantalla de inicio").

## Layout responsivo por rol
- **≥1024px + rol admin/empleado:** panel de escritorio (sidebar de navegación +
  topbar + contenido).
- **<1024px, o rol locatario en cualquier ancho:** experiencia móvil (header +
  tarjetas + navegación inferior + botón +).
- El cambio de layout es automático según rol + ancho de pantalla, sin recargar la
  página.

## Cómo probar localmente antes de subir
```bash
node _devserver.cjs
```
y abrir `http://localhost:5183` (sirve la carpeta igual que la vería GitHub Pages —
evita el problema de `localStorage` bloqueado que da abrir el HTML como `file://`
directo). **Probar siempre en desktop (≥1024px) y en móvil** antes de dar un cambio
por bueno.

## Git y despliegue
- Repo: `github.com/llorente21/asigna-tickets`, rama `main`.
- Despliegue automático a GitHub Pages en ~1 minuto tras el push a `main`.
- Producción: https://llorente21.github.io/asigna-tickets/
- **Este es un proyecto compartido** — se trabaja el plan y el código localmente
  usando una rama de git; commit y push a `main` solo por instrucción explícita del
  usuario (Jose). No dejar cambios de una tarea terminada sin subir cuando él lo pida
  — el objetivo es que GitHub y producción siempre coincidan con lo acordado.
- Verificar el despliegue después de cada push a `main` (por ejemplo con curl contra
  el `index.html` público) antes de dar la tarea por terminada.

### Autenticación de git para push (siempre GitHub device login)

El entorno del agente (la VM Linux que puentea con la carpeta del usuario) **no
tiene credenciales de git preconfiguradas** — ni credential helper, ni `gh` instalado
por defecto, ni token en variables de entorno. Un `git push` directo falla con
`could not read Username for 'https://github.com'`.

**Siempre usar el flujo de device login de GitHub para autenticar el push** — no
pedir al usuario un token de acceso personal ni intentar otros métodos. Pasos:

1. Pedir un `device_code` a la API de GitHub:
   ```bash
   curl -s -X POST https://github.com/login/device/code \
     -H "Accept: application/json" \
     -d "client_id=178c6fc778ccc68e1d6a" \
     -d "scope=repo"
   ```
   (ese `client_id` es el cliente OAuth público del propio `gh` CLI — no es secreto).
   Devuelve `device_code`, `user_code`, `verification_uri` (siempre
   `https://github.com/login/device`) y `expires_in` (~15 min).
2. Mostrar al usuario el `user_code` y pedirle que lo ingrese en esa URL — usar
   `AskUserQuestion` con al menos 2 opciones reales (ej. "Ya lo autoricé" /
   "Cancelar"; el tool rechaza preguntas de una sola opción).
3. Hacer *polling* del token con el `device_code` (cada ~5s, en llamadas de
   `device_bash` separadas si hace falta esperar la respuesta del usuario — los
   procesos en segundo plano **no sobreviven entre llamadas** porque cada llamada de
   `device_bash` corre en su propio namespace aislado que se destruye al terminar):
   ```bash
   curl -s -X POST https://github.com/login/oauth/access_token \
     -H "Accept: application/json" \
     -d "client_id=178c6fc778ccc68e1d6a" \
     -d "device_code=$DEVICE_CODE" \
     -d "grant_type=urn:ietf:params:oauth:grant-type:device_code"
   ```
   Responde `{"error":"authorization_pending",...}` hasta que el usuario autoriza, y
   entonces `{"access_token":...,"scope":"repo"}`.
4. **No usar `gh auth login --with-token` para validar el token** — `gh` exige
   además el scope `read:org` y rechaza un token que solo tiene `repo` (scope
   suficiente para hacer push). Configurar el *credential helper* de git
   directamente en vez de depender de `gh`:
   ```bash
   git config --global credential."https://github.com".helper \
     '!f() { echo username=x-access-token; echo "password=$TOKEN"; }; f'
   ```
5. Hacer el push. Cada `device_code` es de un solo uso — si algo falla a mitad de
   camino (por ejemplo el proceso que mostraba el código murió antes de que el
   usuario alcanzara a autorizar), pedir un `device_code` nuevo, no reintentar con el
   mismo.
