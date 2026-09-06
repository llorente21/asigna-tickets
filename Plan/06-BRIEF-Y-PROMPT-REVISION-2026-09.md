# Brief de producto y prompt de revisión — ASIGNA hacia una app segura, intuitiva, ágil y productiva

Estado: **borrador, pendiente de decisiones de Jose antes de tocar código**. No forma
parte todavía de `02-FUNCIONALIDAD.md` ni `03-ROADMAP.md` — se integrará ahí una vez
resueltos los puntos de conflicto listados abajo.

## 1. Contexto de producto (dado por Jose, 2026-09-02)

> **ASIGNA** — App para desktop y móvil de gestión de incidentes.
>
> **Objetivo:** Gestionar el levantamiento de información, seguimiento, y respuesta a
> un incidente, a través de creación de tickets.
>
> **Flujo:**
> - Darse de alta en el sistema, de manera individual, o con la posibilidad de ser
>   asistido.
> - Generar un ticket personal, o a través del administrador, para documentación del
>   incidente.
> - Asignación del ticket a un suplidor o empleado para su solución.
> - Seguimiento y actualización de cada ticket.
> - Conclusión, cierre y notificación.
> - Posibilidad de calificación del servicio.
>
> **Seguridad:** Cada actor del proceso podrá tener acceso solo a los tickets
> relacionados a su perfil. El administrador y los empleados de la empresa gestora
> tendrán acceso a la visibilidad y modificación de toda la información.
>
> **Roles:**
> - **Administrador:** capacidad para visión, creación y modificación de toda la
>   información generada en la app (incluyendo creación de perfiles), excepto
>   aquella que atente contra la funcionalidad adecuada de la misma.
> - **Empleados:** capacidad para visualización de toda la información generada en
>   la app, creación y modificación limitada a actualizaciones de tickets y
>   asignación de trabajo. Incluye la creación y modificación de perfiles, sin
>   acceso a otorgar funciones superiores o iguales ni para sí mismo ni para otros.
> - **Empresas (Locatarios):** capacidad para creación de perfil, creación de
>   tickets, comentarios sobre tickets abiertos, y visualización de estatus solo de
>   sus tickets.

**Adición de Jose (mismo día):** la parte analítica (Dashboard) es **fundamental**
para el proyecto — no es un extra, es un pilar del producto.

## 2. Puntos que este brief cambia respecto a lo ya construido

Comparado contra `Plan/02-FUNCIONALIDAD.md` y `Plan/04-MILESTONES.md`, este brief
introduce o revierte varias cosas. **Ningún agente debe implementar estos puntos sin
que Jose confirme la decisión primero** — ver la sección 3 (prompt) para el mecanismo
exacto.

| # | Punto del brief nuevo | Estado actual en ASIGNA | Tipo de conflicto |
|---|---|---|---|
| 1 | "Cada actor... acceso solo a los tickets relacionados a su perfil" como garantía de **seguridad** | Las reglas de Firestore solo validan la *forma* de los datos, no *quién* escribe/lee (login casero, sin Firebase Authentication) — cualquiera con el `apiKey` público puede leer todo. Ver `01-ARQUITECTURA.md`. | **El más importante.** Hoy esa garantía de seguridad NO existe realmente a nivel de base de datos, solo a nivel de UI. Pedir explícitamente "una app segura" obliga a resolver esto, no solo a mantenerlo documentado como deuda técnica. |
| 2 | Darse de alta "de manera individual" (auto-registro) | README: "No hay auto-registro: el acceso siempre lo otorga la administración." | Contradicción directa. |
| 3 | "Posibilidad de calificación del servicio" | Se **quitó** la calificación de 1-5 estrellas el 2026-09-01 junto con el paso "Resuelto" (ver `04-MILESTONES.md`). | Reintroduce algo removido a propósito recientemente — hay que saber si fue un error quitarlo o si el contexto pide algo distinto (ej. calificación sin el paso "Resuelto"). |
| 4 | Empleados con "creación y modificación de perfiles" (limitada) | Hoy Empleado **no tiene acceso** a la sección Usuarios en absoluto. | Amplía permisos del rol Empleado. |
| 5 | Asignar ticket a "un suplidor o empleado" | El modelo actual solo asigna responsables internos (Admin/Empleado); no existe el concepto de suplidor/proveedor externo. | Rol o entidad nueva, con sus propias implicaciones de acceso (¿el suplidor entra a la app? ¿solo se le notifica?). |
| 6 | Empleados "visualización de toda la información" | Hoy Empleado no ve el Dashboard (solo Administrador). | Ambigüedad: ¿"toda la información" incluye el Dashboard/analítica? |

Puntos que **no** entran en conflicto (se mantienen igual): el rol Locatario ya está
limitado a sus propios tickets + comentarios + creación; el Administrador ya tiene
control total; el flujo general (crear → asignar → dar seguimiento → cerrar →
notificar) ya es como funciona ASIGNA hoy, solo con nombres/pasos ligeramente
distintos.

## 3. Prompt para el agente que ejecute esta revisión

Todo lo de abajo, desde "Actúa como..." hasta el final, es el prompt a usar (en esta
misma sesión o en una nueva) para hacer la revisión y los ajustes.

---

> Actúa como el agente de desarrollo de ASIGNA (sistema de tickets/help desk para la
> Red de Oficinas Felices, repo `oficinas-felices-tickets`). Antes de escribir una
> sola línea de código, haz lo siguiente:
>
> **1. Repaso del estado actual**
> Lee completo, en este orden: `Plan/04-MILESTONES.md`, `Plan/01-ARQUITECTURA.md`,
> `Plan/02-FUNCIONALIDAD.md`, `Plan/03-ROADMAP.md`, `Plan/05-ESTANDARES.md`, y el
> `README.md` de la raíz. Confirma que entiendes: los 3 roles actuales y sus permisos
> reales, el flujo de 3 estatus (Nuevo → En proceso → Cerrado), el modelo de datos en
> Firestore, y la limitación de seguridad conocida (login casero, sin Firebase
> Authentication, reglas que solo validan forma de datos).
>
> **2. Compara contra el brief de producto**
> Lee la sección 1 de este documento (`Plan/06-BRIEF-Y-PROMPT-REVISION-2026-09.md`) —
> es el objetivo de producto que Jose quiere alcanzar: una app **segura, intuitiva,
> ágil y productiva** para gestión de incidentes vía tickets, donde el **Dashboard /
> analítica es un pilar fundamental del producto**, no un extra.
>
> **3. Detente en los puntos de conflicto — no los resuelvas por tu cuenta**
> La sección 2 de este documento lista 6 puntos donde el brief nuevo contradice o
> amplía decisiones ya tomadas (auto-registro, calificación del servicio, permisos de
> Empleado sobre perfiles, concepto de "suplidor" externo, visibilidad del Dashboard
> para Empleado, y sobre todo: la brecha entre "cada actor solo ve sus tickets" como
> garantía de seguridad y la realidad actual de las reglas de Firestore). Para cada
> uno, preséntaselos a Jose con una recomendación técnica concreta y espera su
> decisión antes de tocar `index.html` o `firestore.rules`. No asumas la respuesta
> "más razonable" — son decisiones de producto y de riesgo de seguridad, no de
> implementación.
>
> **4. Con las decisiones tomadas, arma un plan de ajustes priorizado** que cubra
> estos cuatro criterios de calidad, con ejemplos concretos de qué revisar en ASIGNA
> para cada uno (no en abstracto):
>
> - **Segura:** ¿la garantía de "cada actor solo ve lo suyo" se puede sostener sin
>   Firebase Authentication, o es el momento de migrar? Si se migra, ¿cómo se hace
>   sin romper las cuentas y contraseñas ya existentes en Firestore? Revisar también:
>   ¿las reglas de Firestore ya están alineadas al flujo de 3 estatus, o siguen
>   permitiendo los 5 antiguos? ¿hay algún dato sensible expuesto que no debería
>   estarlo (contraseñas en texto plano, por ejemplo)?
> - **Intuitiva:** revisar los flujos de creación de ticket, asignación, y
>   seguimiento en ambos layouts (panel de escritorio ≥1024px y experiencia móvil) —
>   ¿son igual de claros para un Locatario que reporta por primera vez que para un
>   Empleado que gestiona docenas de tickets? ¿el nuevo flujo de alta (individual o
>   asistida) es igual de simple que el actual (todo lo crea el admin)?
> - **Ágil:** tiempos de respuesta percibidos (REST directo a Firestore, sin SDK, ya
>   ayuda a esto — no romperlo), cantidad de clics/pantallas para las tareas más
>   frecuentes (crear ticket, cambiar estatus, comentar), y qué tan rápido un
>   Administrador o Empleado puede pasar de una vista general a un ticket específico.
> - **Productiva (con foco en el Dashboard):** dado que Jose marcó la analítica como
>   fundamental, evaluar si las métricas actuales (tickets por categoría, por
>   locación, distribución por estatus, promedio de días de solución, tendencia
>   mensual) son suficientes o si faltan métricas clave para la gestión real de
>   incidentes (ej. carga de trabajo por empleado/suplidor, tickets vencidos por SLA
>   en tiempo real, tasa de reapertura, tiempo de primera respuesta vs tiempo de
>   resolución). Evaluar también quién debería poder ver el Dashboard (hoy solo
>   Administrador) a la luz de lo que se decida en el punto 3.
>
> **5. Antes de implementar:** confirma el plan de ajustes con Jose (resumen breve,
> priorizado, con lo que requiere migración de datos claramente marcado). Trabaja en
> una rama nueva — nunca directo en `main`. Prueba cada cambio en desktop (≥1024px) y
> móvil con `node _devserver.cjs` antes de darlo por bueno.
>
> **6. Al terminar (o al cerrar cada bloque de trabajo):** actualiza
> `Plan/02-FUNCIONALIDAD.md` / `Plan/01-ARQUITECTURA.md` si cambió el modelo de datos
> o roles, agrega la entrada correspondiente en `Plan/04-MILESTONES.md`, mueve los
> puntos resueltos de `Plan/03-ROADMAP.md`, y registra cualquier lección aprendida en
> `Plan/05-ESTANDARES.md`. Commit descriptivo en español; push a `main` **solo** si
> Jose lo indica explícitamente — si hace falta autenticar el push, usar siempre el
> flujo de GitHub device login documentado en `01-ARQUITECTURA.md`.

---

## 4. Decisiones tomadas por Jose (2026-09-02)

| # | Punto | Decisión |
|---|---|---|
| 1 | Seguridad | **Migrar a Firebase Authentication** (solución real, no la mejora intermedia). |
| 2 | Auto-registro | **Con aprobación del admin/empleado** — el locatario se registra solo, pero la cuenta queda pendiente hasta aprobación. |
| 3 | Calificación del servicio | **Sí, al cerrar el ticket** (1-5 estrellas), sin reintroducir el paso "Resuelto". Flujo sigue siendo Nuevo → En proceso → Cerrado. |
| 4 | "Suplidor" | **Etiqueta/categoría de responsable, sin cuenta propia** — el suplidor no entra a ASIGNA, alguien interno lo registra y le da seguimiento. |
| 5 | Empleado — perfiles | **Sí** — puede crear/editar cuentas de Locatario (no Admin/Empleado, no puede otorgarse ni otorgar roles iguales o superiores). |
| 6 | Empleado — Dashboard | **Sí** — acceso de solo lectura al Dashboard. |

Ya no son puntos abiertos: quedan integradas en `02-FUNCIONALIDAD.md` cuando se
implementen, y removidas de aquí como pendiente de decisión.

## 5. Plan de ajustes priorizado

**Fase 1 — Seguridad real (Firebase Authentication).** Base de todo lo demás: hacer
auto-registro y ampliar permisos de Empleado sin identidad verificable solo agregaría
más superficie a la misma vulnerabilidad conocida. Migración sin backend propio:
usar el REST endpoint de Identity Toolkit (`accounts:signUp`) para crear en Firebase
Auth una cuenta por cada usuario ya existente en Firestore, usando su mismo
email+contraseña en texto plano (nadie tiene que resetear su clave). Luego:
reescribir `firestore.rules` para verificar `request.auth` (identidad real, no solo
forma de datos) y dar a cada colección reglas por rol/dueño; cambiar el login de
`index.html` para autenticar contra Firebase Auth (REST `accounts:signInWithPassword`)
en vez de comparar contraseña directo en Firestore. **Alto riesgo si se hace mal —
probar exhaustivamente con las 3 cuentas de rol antes de tocar producción, en una
rama, con respaldo de la colección `usuarios` actual antes de migrar.**

**Fase 2 — Rol Empleado ampliado.** Una vez reescritas las reglas en la Fase 1 (se
hace en el mismo paso, ya que toca las mismas reglas): Empleado puede gestionar
perfiles de Locatario (UI + regla que impide asignar rol admin/empleado) y tiene
acceso de solo lectura al Dashboard (UI + regla de lectura, sin acciones de edición).

**Fase 3 — Auto-registro con aprobación.** Depende de la Fase 1 (crea cuentas reales
en Firebase Auth). Pantalla de registro para Locatario (nunca para Admin/Empleado),
cuenta nueva con `aprobado: false`; notificación a Admin/Empleado; el locatario puede
iniciar sesión pero ve "cuenta pendiente de aprobación" hasta que se apruebe — no
accede a tickets ni puede crearlos antes de eso.

**Fase 4 — Calificación del servicio.** Independiente de las anteriores, bajo riesgo:
al cerrar un ticket, el locatario puede calificar 1-5 estrellas (campo opcional en el
ticket); agregar promedio de calificación al Dashboard.

**Fase 5 — "Suplidor" como catálogo.** Independiente, bajo riesgo: nuevo catálogo
(similar a Empresas) de proveedores/suplidores externos; el campo "responsable" del
ticket puede apuntar a un Empleado interno o a un Suplidor del catálogo.

**Fase 6 — Dashboard como pilar (productiva).** Ampliar métricas: carga de trabajo
por responsable (empleado/suplidor), vencidos por SLA en tiempo real, tasa de
reapertura, tiempo de primera respuesta vs. resolución, promedio de calificación
(una vez exista la Fase 4). Aplica la visibilidad de solo lectura para Empleado
definida en la Fase 2.

**Orden sugerido de ejecución:** Fase 1 primero (es la base de seguridad y de las
Fases 2 y 3). Fases 4 y 5 se pueden hacer en paralelo o antes, si se prefiere,
porque no dependen de la migración de Auth. Fase 6 al final, cuando ya existan los
datos de calificación y de suplidor que alimentan las métricas nuevas.
