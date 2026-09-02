# ASIGNA — instrucciones para agentes (código, diseño, o cualquier otro)

Este archivo se carga automáticamente al trabajar en este repositorio. Aplica a
**cualquier agente** que toque este proyecto: el que escribe código en `index.html`,
el que trabaja en `design/`, o cualquier otro.

## Regla obligatoria: lee y mantén `Plan/` actualizada

La carpeta [`Plan/`](Plan/README.md) es la fuente de verdad de planificación de este
proyecto — arquitectura, funcionalidad, roadmap, historial de progreso, estándares y
lecciones aprendidas. **No es opcional.**

**Antes de empezar cualquier tarea no trivial en este repo:**
1. Lee `Plan/04-MILESTONES.md` — qué se ha hecho hasta ahora, en qué quedó la última
   sesión.
2. Lee `Plan/01-ARQUITECTURA.md` y `Plan/02-FUNCIONALIDAD.md` si la tarea toca
   lógica, datos o estructura técnica.
3. Revisa `Plan/03-ROADMAP.md` — la tarea puede ya tener contexto o decisiones
   previas registradas ahí.
4. Sigue las convenciones de `Plan/05-ESTANDARES.md`.

**Al terminar una tarea que valga la pena recordar, actualiza `Plan/` como parte de
terminarla (no como paso opcional aparte):**
- Agrega una entrada a `Plan/04-MILESTONES.md` (qué, por qué, fecha real).
- Si aprendiste algo que evitaría un error futuro, agrégalo a "Lecciones aprendidas"
  en `Plan/05-ESTANDARES.md`.
- Si el cambio abre, cierra o modifica algo del roadmap, actualiza
  `Plan/03-ROADMAP.md`.
- Si el cambio altera arquitectura o modelo de datos, actualiza
  `Plan/01-ARQUITECTURA.md` / `Plan/02-FUNCIONALIDAD.md`.

Esto aplica también al agente de diseño trabajando en `design/`: antes de proponer una
dirección visual nueva, leer `Plan/02-FUNCIONALIDAD.md` (para no romper flujos ni
roles existentes) y `Plan/05-ESTANDARES.md` (tokens de marca ya establecidos). Toda
decisión de diseño adoptada se registra en `Plan/04-MILESTONES.md`.

## Reglas de proyecto (resumen — detalle completo en `Plan/`)

- App de una sola página: todo vive en `index.html`, sin frameworks ni build.
- Backend: Firebase Firestore vía REST API (no SDK), proyecto `asigna-feliz`. Login
  casero (no Firebase Authentication) — ver limitación de seguridad conocida en
  `Plan/01-ARQUITECTURA.md`.
- **Proyecto compartido:** se trabaja en una rama local; commit y push a `main` solo
  por instrucción explícita del usuario (Jose). No asumas que terminar una tarea
  incluye subir a `main`.
- Antes de borrar cualquier documento real en Firestore: releer su ID fresco vía
  REST inmediatamente antes de borrar — nunca reutilizar un ID visto antes en la
  conversación.
- Probar siempre en desktop (≥1024px) y en móvil (`node _devserver.cjs` →
  `http://localhost:5183`) antes de dar un cambio por bueno.
- Para el detalle completo de arquitectura, funcionalidad, roadmap y estándares:
  ver `Plan/README.md` y sus documentos.

La documentación orientada al usuario final/dueño del proyecto sigue en `README.md` en
esta misma carpeta — no se duplica aquí.
