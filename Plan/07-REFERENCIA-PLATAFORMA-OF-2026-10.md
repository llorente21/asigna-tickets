# Referencia: plataforma admin de Oficinas Felices → mejoras para ASIGNA (2026-10)

**Estado:** propuesta. Las decisiones de alcance ya las confirmó Jose (ver abajo).
Todavía no se implementa nada: primero va la aprobación de los mockups
(canvas de Claude Design "ASIGNA — Propuesta referencia OF", https://claude.ai/artifact/RhFvzCZ7ffCTAdfonWf4DX; fuentes `.dc.html` en `design/source/propuesta-referencia-of/`).

## Fuente

Grabación de pantalla `ASIGNA - Grabacion.mp4` (2:36 min, sin narración), compartida
por Jose el 2026-10-29. Muestra la plataforma admin de Oficinas Felices, que está en
demo en `demo.admin.dixdigitalagency.com`. Se ven seis módulos en una barra de
íconos:

| Módulo | Pantallas vistas |
|---|---|
| Operación | Tickets (lista + crear), SLA de tickets, Reservas, Bloqueos |
| Inmuebles | Edificios (lista + nuevo), Oficinas y espacios |
| Clientes | Clientes e inquilinos (lista + crear), Contratos |
| Comercial / Servicios | Solo el ícono; no se abrieron |
| Administración | Usuarios (lista + invitar) |

En la grabación aparecen los edificios DIX Business Center 01–04 y además
**iUKEN Business Center**, que ASIGNA todavía no tiene en sus locaciones.

## Decisiones de Jose (2026-10-29)

1. **Alcance: tickets + espacios.** Se mejoran tickets, SLA y usuarios, y se agrega
   un catálogo de espacios por edificio. No entran Clientes con datos fiscales,
   Contratos, Reservas ni Comercial.
2. **Base: rama de integración.** Las ramas `review/todo-junto` y
   `review/diseno-junto` se fusionaron en `integracion/referencia-of`, y todo lo
   nuevo se construye encima de esa rama. `main` no se tocó.
3. **Estados: los 3 actuales + "En espera" con motivo.** El motivo puede ser cliente,
   proveedor o aprobación, y mientras el ticket está en espera **se pausa el reloj
   del SLA**. No se adoptan los 7 estados del video.
4. **Extras** (prioridad Crítica, Admin cliente, invitar por correo, vista SLA): Jose
   no expresó preferencia. Por eso solo se propone la **vista SLA**, que se apoya en
   el SLA de dos plazos que ya existe. Los otros tres quedan en el roadmap sin
   compromiso.

## Qué tiene la plataforma, qué tiene ASIGNA y qué se propone

| Tema | Plataforma OF | ASIGNA (rama de integración) | Propuesta |
|---|---|---|---|
| Inicio del formulario | Paso 1: edificio. Después, el tipo de incidencia (*Edificio / área común* o *Inquilino*) con un banner que explica cada caso | Paso 1: categoría. Paso 2: detalles | Paso 1 **¿Dónde?** (edificio + tipo: *Oficina de un inquilino* / *Área común*) y **¿Qué?** (categoría). El banner cambia según el tipo |
| Ubicación precisa | "Espacio registrado" (opcional, de un catálogo) + "Área o ubicación" en texto libre con un ejemplo | Solo la locación D1–D4 | `espacio_id` (catálogo) + `ubicacion_detalle` libre. El detalle es obligatorio cuando el ticket es de área común |
| Título | Campo propio, obligatorio | No existe; la tarjeta muestra categoría · subcategoría | `titulo` opcional, que se prellena con categoría · subcategoría y se puede editar |
| Estados | 7 (Abierto, En revisión, Pend. aprobación/cliente/proveedor, En proceso, Resuelto) | 3 (Nuevo, En proceso, Cerrado) | 3 + **En espera** con `espera_motivo`, que pausa el SLA |
| Asignación | Responsable + proveedor en la misma celda | Ya existe en la rama: Responsable interno + Asignado a (ejecuta) | Se mantiene. Además, el responsable del edificio queda como responsable interno sugerido |
| SLA | Vista con dos listas: *Vencidos* y *En riesgo* (vence en < 4 h). Se elige primera respuesta o resolución. Hora de Santo Domingo | Dos plazos por prioridad y badges de vencido | Vista **SLA** con *Vencidos* y *En riesgo*, filtros por tipo de plazo y por edificio, y la fecha límite visible en la lista |
| Lista de tickets | Columnas: Ticket, Tipo/Ubicación, Prioridad, Estado, Asignación, SLA resolución, Acciones (ver / asignar / cambiar estado) | Tarjetas o tabla con columna Acciones (solo "ver") | Columna **Vence** con chip de riesgo, ubicación en una línea y acción rápida de cambiar estado |
| Filtros | Hay que pulsar "Filtrar" | Búsqueda y filtros instantáneos | Se mantienen instantáneos (es mejor que la plataforma) |
| Edificios | Código automático (DIX-01), dirección, ciudad, sector, responsable, estado, amenidades. La lista muestra ocupación % y oficinas ocupadas / total | Locaciones D1–D4 editables (solo nombre) | Locación con `direccion` y `responsable_email` (opcionales). Agregar iUKEN si Jose lo confirma |
| Espacios | Tipo, piso, capacidad, precio, disponible, reservable y foto. KPIs arriba | No existe | Colección `espacios` mínima: código, nombre, tipo, piso, locación, empresa ocupante y estado. Sin precio ni reservas |
| Usuarios | Invitar en 3 secciones numeradas (Identidad y rol → Alcance → Permisos). 9 roles | Admin crea la cuenta con contraseña o la aprueba si llegó por auto-registro. 3 roles | En el formulario de usuario: secciones numeradas y elegir su **espacio** (oficina) además de la locación. Roles nuevos: solo en el roadmap |

## Propuesta por fases (cada una en su propia rama, sobre `integracion/referencia-of`)

### Fase A — "En espera" con motivo y pausa del SLA
- Nuevo estado `en_espera` entre En proceso y Cerrado:
  `STATUS_FLOW = ['nuevo','en_proceso','en_espera','cerrado']`.
- Campos del ticket:
  - `espera_motivo` (`cliente` | `proveedor` | `aprobacion`).
  - `espera_desde` (ISO).
  - `sla_pausado_ms`: acumulado. Al salir de espera se suma `ahora - espera_desde`.
- `isVencidoRespuesta`/`isVencidoResolucion` restan `sla_pausado_ms`, y también
  el tramo en curso si el ticket sigue en espera.
- Al pasar a En espera es obligatorio elegir el motivo. La nota ya es obligatoria en
  la rama.
- Si el motivo es **cliente**, el Locatario recibe una notificación ("Necesitamos tu
  respuesta").
- Firestore: la regla vigente de `update` en `tickets` no restringe `status`, así que
  **no hacen falta reglas nuevas**.
- Tickets viejos: no tienen estos campos y se tratan como 0 de pausa.

### Fase B — Catálogo de espacios + datos de la locación
- Colección nueva `espacios/{id}`:
  - Obligatorios: `id`, `nombre`, `locacion`.
  - Opcionales: `codigo` (se genera como `D1-1A`), `tipo` (`oficina`, `sala`,
    `area_comun`, `parqueo`, `tecnico`), `piso`, `empresa_id`, `activo`.
- Sección **Espacios** en el panel (solo Admin), con el mismo patrón que
  Empresas/Suplidores: tarjetas o tabla, filtro por locación y 4 KPIs (total,
  ocupados, libres, áreas comunes).
- Locación: se agregan `direccion` y `responsable_email` (opcionales), editables en
  Configuración.
- Regla a publicar (igual que `locaciones`):
  ```
  match /espacios/{espacioId} {
    allow read: if autenticado();
    allow create, update: if soyAdmin() && tieneClaves(request.resource.data, ['id','nombre','locacion']);
    allow delete: if soyAdmin();
  }
  ```
- La lectura va en su propio `try/catch`, por si la regla todavía no se ha publicado
  (lección aprendida).

### Fase C — Formulario de nuevo ticket
- **Paso 1 — ¿Dónde y qué?**
  - Edificio. Para el Locatario viene fijado con su locación.
  - Tipo: *Mi oficina / oficina de un inquilino* o *Área común*.
  - Categoría y, si aplica, subcategoría.
  - El banner cambia según el tipo:
    - Área común: "Para parqueo, techo, cisterna, ascensor… El seguimiento es
      interno."
    - Oficina: "La oficina/empresa afectada recibe las actualizaciones."
- **Paso 2 — Detalles**
  - Espacio registrado (opcional). Se filtra por edificio y, para un Locatario, viene
    prellenado con su oficina.
  - Área o ubicación, con el ejemplo "Ej.: parqueo nivel 1, baño del 2º piso, cuarto
    eléctrico". Es obligatoria en área común.
  - Título (prellenado), descripción, prioridad, fecha y "reportado por" (staff).
- Campos nuevos del ticket: `tipo_incidencia` (`inquilino` | `area_comun`),
  `espacio_id`, `espacio_nombre`, `ubicacion_detalle`, `titulo`.
- Firestore: no se agregan claves requeridas, porque `tieneClaves` solo exige las
  existentes. **No hacen falta reglas nuevas.**
- La exportación CSV agrega Tipo, Espacio, Ubicación y Título.

### Fase D — Lista de tickets + vista SLA
- Tabla con estas columnas:
  - Ticket (número + título).
  - Ubicación (edificio · espacio · detalle).
  - Prioridad.
  - Estado (con el motivo cuando está en espera).
  - Asignación (responsable / proveedor).
  - **Vence**: fecha límite de resolución con chip *En riesgo* o *Vencido*.
  - Acciones: ver y cambiar estado.
- Vista **SLA**, solo para staff:
  - Selector de plazo: Primera respuesta / Resolución.
  - Filtro por edificio.
  - Dos bloques: **Vencidos** y **En riesgo**.
  - Umbral de "en riesgo": 4 h para respuesta y 24 h para resolución, editable en
    Configuración.
  - Nota de pie: "Horas de Santo Domingo. Solo tickets abiertos; los tickets en
    espera no cuentan."

## Patrones de UI que se adoptan (en todas las fases)
- **Obligatorios con `*`**: los campos obligatorios llevan `*`, y debajo de cada
  campo va un texto de ayuda con un ejemplo concreto.
- **Valores por defecto**: el formulario llega prellenado con lo que ya se sabe
  (locación del locatario, fecha y hora actual, prioridad Media).
- **Códigos automáticos**: se muestran pero no se editan, con el texto "Se genera al
  guardar".
- **Formularios largos**: secciones numeradas (01, 02, 03) con un título y una línea
  de descripción.
- **Banners que cambian**: el banner informativo cambia según lo que eligió el
  usuario. No es un texto fijo.
- **Estados vacíos**: dicen qué hacer y dónde. Ejemplo: "Todavía no hay espacios en
  D3 — créalos en Espacios".
- **Breadcrumbs en escritorio**: debajo del título de la sección, por ejemplo
  *Tickets / OF-1234567*.
- **Un teléfono, una columna**: el formulario usa una sola columna en móvil. Ya está
  aplicado en la rama de integración.

## Qué NO se copia de la plataforma
- **Errores técnicos crudos**: no se le muestra al usuario un mensaje como "resource
  not found (solicitud …)" (la vista SLA del video estaba rota así). Se usan mensajes
  humanos y se registra el detalle en la consola.
- **Botón "Filtrar"**: ASIGNA filtra al instante.
- **KPIs que dependen de la paginación** ("En esta página: 25").
- **Valores sin traducir** como "OTHER", o listas con scroll horizontal.
- **Permisos como texto separado por comas** ("Denegaciones").
- **Formularios con ~18 campos legales obligatorios**: ASIGNA no los necesita para
  tickets.
- **Solo escritorio**: ASIGNA mantiene su experiencia móvil para Locatarios.

## En el roadmap, sin compromiso (Jose no dio preferencia)
- **Prioridad "Crítica"**: 4 niveles, cada uno con su SLA.
- **Rol "Admin cliente"**: un Locatario que ve los tickets de toda su empresa. Toca
  las reglas de seguridad por fila.
- **Invitar usuario por correo**: la persona elige su contraseña. Se apoyaría en
  `accounts:sendOobCode`, que ya se usa para el reset.
- **Número secuencial legible** (`OF-2026-000012`): hoy es `OF-` + los últimos 7
  dígitos del id. Un contador seguro necesita una transacción de Firestore (REST
  `:commit` con precondición).

## Observaciones de seguridad encontradas durante la revisión
- **Edición del ticket por el Locatario**: la regla `allow update` de `tickets` deja
  que el Locatario dueño edite **cualquier campo** de su ticket (estado, prioridad,
  responsable). Así funcionan hoy la calificación y la reapertura, pero también le
  permitiría cambiar el estado por REST. Conviene restringirla con
  `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` cuando se
  toquen las reglas. No es urgente; queda anotado.
