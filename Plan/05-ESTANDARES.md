# Estándares de desarrollo, skills y lecciones aprendidas

## Convenciones de código
- **Todo en `index.html`.** No dividir en archivos aparte de CSS/JS — es un requisito
  del proyecto, no una limitación temporal. Ver `01-ARQUITECTURA.md`.
- **Sin dependencias externas / sin build.** No agregar frameworks, bundlers ni
  gestores de paquetes al flujo de `index.html`. Si se necesita una librería, debe
  poder incluirse como `<script>` inline o CDN simple, evaluando primero si hace
  falta de verdad.
- **Mensajes de commit en español**, describiendo el qué y el porqué, terminando con:
  `Co-Authored-By: Claude <noreply@anthropic.com>`
- **Textos de UI en español** (público objetivo: staff y locatarios de Oficinas
  Felices).
- **Nombres de colecciones/campos de Firestore ya establecidos** (`tickets`,
  `usuarios`, `notificaciones`, `empresas`, `categorias` — ver `02-FUNCIONALIDAD.md`)
  no se renombran sin razón fuerte: requeriría migración de datos reales en
  producción.

## Checklist antes de dar un cambio por bueno
1. Probar en local con `node _devserver.cjs` (`http://localhost:5183`).
2. Probar **desktop (≥1024px)** y **móvil (<1024px)** — el layout cambia
   automáticamente según rol + ancho.
3. Si el cambio toca Firestore: confirmar que las reglas actuales permiten la
   operación (ver `firestore.rules` documentado en el `README.md` raíz), y si es una
   colección/campo nuevo, aislar la petición en su propio try/catch.
4. Si el cambio borra datos reales: releer el ID fresco por REST inmediatamente antes
   de borrar (nunca reusar un ID visto antes en la conversación).
5. `git add` + `git commit` con mensaje descriptivo en español.
6. Push a `main` **solo cuando el usuario lo indique explícitamente** — hasta entonces
   trabajar en una rama.
7. Tras un push a `main`: verificar que
   https://llorente21.github.io/asigna-tickets/ ya sirve el cambio (esperar ~1 min,
   confirmar por ejemplo con curl) antes de cerrar la tarea.
8. Actualizar `Plan/04-MILESTONES.md` (y `03-ROADMAP.md` si aplica) con lo hecho.

## Skills relevantes para este proyecto
- **manga-app-builder** — aunque nombrada por otro proyecto (MANGA), describe el
  mismo patrón que sigue ASIGNA: apps de una sola página con Firebase, roles, CRUD,
  dashboard, PWA y despliegue en GitHub Pages. Útil como referencia de patrones
  probados (carga masiva CSV, exportación, autenticación por roles) si se necesita
  algo similar aquí.
- **design** (Claude Design / canvas) — para explorar direcciones visuales o mockups
  antes de tocar `index.html` directamente. Los archivos ya generados están en
  `design/` (ver `design/README.md` para cómo verlos/editarlos). Los `.dc.html` no
  dependen de Firebase — son maquetas con datos de ejemplo, no tocar la app real desde
  ahí.
- **superpowers** — para tareas con varias partes o que podrían salir mal de varias
  formas: planificar antes de construir, definir criterios de calidad, revisar antes
  de dar por terminado. Razonable para cambios que toquen varias colecciones de
  Firestore a la vez, o que cambien el modelo de roles/estatus.

## Lecciones aprendidas

- **Caché viciada del Service Worker tras deploys** (commit `4f42058`): un `sw.js` con
  estrategia cache-first puede seguir sirviendo una versión vieja del `index.html`
  después de un push a producción, aunque GitHub Pages ya tenga el archivo nuevo. Se
  resolvió pasando a **network-first con `cache: 'no-store'`**. No revertir esta
  estrategia sin una razón explícita — es la causa más probable si un usuario reporta
  "no veo el cambio" después de un deploy confirmado.
- **Firestore sin Authentication real:** las reglas de seguridad solo validan la forma
  de los datos, no la identidad de quien escribe (login casero, no Firebase Auth). No
  tratar las reglas actuales como protección real de datos — es una limitación
  conocida y aceptada para uso interno, documentada en `01-ARQUITECTURA.md`. No
  prometer al usuario una seguridad que las reglas no dan.
  - **Antes de borrar un documento real, releer su ID por REST justo antes de
  borrar** — un ID visto antes en la conversación puede ya no ser el correcto (el
  documento pudo cambiar entre medio).
- **Colecciones nuevas quedan bloqueadas hasta que el usuario publique la regla**: el
  agente no tiene acceso a la consola de Firebase. Si una tarea requiere una colección
  nueva, entregar el texto exacto de la regla a pegar, y aislar la lectura/escritura
  nueva en su propio try/catch para que un 403 temporal no rompa el resto de la app
  mientras el usuario publica la regla.
- **El repo es compartido** — no asumir que "terminar la tarea" incluye push a `main`.
  Trabajar en rama, avisar que está listo, y esperar instrucción explícita de Jose
  para hacer merge/push a `main`.

_Agregar nuevas lecciones aquí a medida que aparezcan — con contexto suficiente para
que el próximo agente no repita el mismo error._
