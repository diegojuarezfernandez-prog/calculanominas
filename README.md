# CalculaNominas.es

Web estática con calculadoras laborales y fiscales para España (2026):

| Página | Archivo | Lógica |
|---|---|---|
| Sueldo neto | `index.html` | `calc.js` (algoritmo de retenciones AEAT 2026 + cotizaciones SS 2026) |
| Neto a bruto | `neto-a-bruto/index.html` | usa `calc.js` (búsqueda binaria) |
| Finiquito e indemnización | `finiquito/index.html` | `finiquito/finiquito.js` |
| Paro | `paro/index.html` | `paro/paro.js` (IPREM 2026) |
| Paga extra de Navidad | `paga-extra/index.html` (generada) | `paga-extra/paga.js` + `calc.js` |
| Baja médica | `baja-medica/index.html` (generada) | `baja-medica/baja.js` |
| Páginas por cifra | `sueldo-neto/<bruto>/`, `neto-a-bruto/<neto>/`, `sueldo-neto/` (generadas) | `calc.js` |
| Quiénes somos y cómo calculamos | `como-calculamos/` (generada) | — |
| Calculadora para otras webs | `insertar/` y `widget/sueldo-neto/` (generadas) | `calc.js` |

## Páginas generadas
Las páginas marcadas como generadas, el menú, el pie, la fecha "Actualizado el…", el bloque de fuentes oficiales y `sitemap.xml` salen de `tools/generar.js` (plantillas en `tools/`). Después de cambiar parámetros en los `.js`, o para cambiar la fecha de actualización (`ACTUALIZADO` en `tools/plantilla.js`), ejecuta:

```
node tools/generar.js
```

y sube el resultado. No edites a mano los archivos generados: se sobrescriben. La carpeta `tools/` no se publica (regla en `netlify.toml`).

Netlify publica la rama `main` automáticamente. Los cambios de normativa se proponen en ramas aparte como pull request para revisarlos antes de publicar.

## Parámetros normativos que hay que revisar cada año
- `calc.js`: escala de retención, mínimo personal y familiar, reducción por rendimientos del trabajo, límites excluyentes, tipos de cotización, base máxima, cuota de solidaridad.
- `paro/paro.js`: IPREM, topes, porcentajes, tabla de duración.
- `finiquito/finiquito.js`: días de indemnización por tipo de extinción y topes.
- `baja-medica/baja.js`: porcentajes de la incapacidad temporal y base máxima de cotización.
- `tools/plantilla.js`: año (`ANIO`), fecha de actualización y enlaces a las fuentes oficiales.
- Textos explicativos y tablas de ejemplo en cada `index.html`.
