# Diseño visual — ASIGNA

Carpeta para el sistema de diseño visual de ASIGNA (creado con Claude Design).

## Qué va aquí

Los archivos exportados del canvas de Claude Design: artboards `.dc.html`,
imágenes de referencia y cualquier export (PNG / PDF) que sirva de guía visual.

## Cómo usarlo

1. Copia aquí los archivos del canvas.
2. Los `.dc.html` se abren directamente en el navegador (doble clic) — no
   requieren servidor ni build.
3. Esta carpeta es **solo referencia de diseño**. No la carga la app:
   `index.html`, `manifest.json` y `sw.js` en la raíz siguen siendo lo que
   se publica en GitHub Pages.

## Convención de nombres

Un archivo por pantalla o por grupo de artboards, en minúsculas y con guiones:

```
design/
  tokens.dc.html          colores, tipografía, espaciado
  mobile-locatario.dc.html
  desktop-panel.dc.html
  flujo-tickets.dc.html
```
