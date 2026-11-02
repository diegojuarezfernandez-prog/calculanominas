# CalculaNominas.es

Web estática con calculadoras laborales y fiscales para España (2026):

| Página | Archivo | Lógica |
|---|---|---|
| Sueldo neto | `index.html` | `calc.js` (algoritmo de retenciones AEAT 2026 + cotizaciones SS 2026) |
| Neto a bruto | `neto-a-bruto/index.html` | usa `calc.js` (búsqueda binaria) |
| Finiquito e indemnización | `finiquito/index.html` | `finiquito/finiquito.js` |
| Paro | `paro/index.html` | `paro/paro.js` (IPREM 2026) |

Netlify publica la rama `main` automáticamente. Los cambios de normativa se proponen en ramas aparte como pull request para revisarlos antes de publicar.

## Parámetros normativos que hay que revisar cada año
- `calc.js`: escala de retención, mínimo personal y familiar, reducción por rendimientos del trabajo, límites excluyentes, tipos de cotización, base máxima, cuota de solidaridad.
- `paro/paro.js`: IPREM, topes, porcentajes, tabla de duración.
- `finiquito/finiquito.js`: días de indemnización por tipo de extinción y topes.
- Textos explicativos y tablas de ejemplo en cada `index.html`.
