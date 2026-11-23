#!/usr/bin/env node
/* Genera las páginas estáticas de CalculaNominas.es y actualiza menú, pie y sitemap.
   Uso:  node tools/generar.js
   Cuando cambie la normativa: actualiza calc.js / paro.js / ..., cambia ACTUALIZADO (y ANIO si toca)
   en tools/plantilla.js y vuelve a ejecutar este script. Es seguro ejecutarlo varias veces. */
"use strict";
const fs = require("fs");
const path = require("path");
const T = require("./plantilla.js");
const C = require("./paginas-cifra.js");
const N = require("./paginas-nuevas.js");

const RAIZ = path.join(__dirname, "..");
const escribir = (ruta, html) => {
  const f = path.join(RAIZ, ruta);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
};

// 1. Páginas generadas
C.BRUTOS.forEach((b, i) => escribir(`sueldo-neto/${b}/index.html`, C.paginaBruto(b, i)));
C.NETOS.forEach((n, i) => escribir(`neto-a-bruto/${n}/index.html`, C.paginaNeto(n, i)));
escribir("sueldo-neto/index.html", C.paginaIndice());
escribir("paga-extra/index.html", N.pagaExtra());
escribir("baja-medica/index.html", N.bajaMedica());
escribir("como-calculamos/index.html", N.comoCalculamos());
escribir("insertar/index.html", N.insertar());
escribir("widget/sueldo-neto/index.html", N.widget());
escribir("cuota-autonomos/index.html", require("./pagina-autonomos.js").cuotaAutonomos());

// 2. Páginas existentes: menú, pie, fecha de actualización y fuentes
const EXISTENTES = {
  "index.html": ["aeat", "ss"],
  "neto-a-bruto/index.html": ["aeat", "ss"],
  "finiquito/index.html": ["et"],
  "paro/index.html": ["sepe", "lgss"],
  "aviso-legal.html": null, "privacidad.html": null, "cookies.html": null, "404.html": null
};
const ENLACES_CIFRA = {
  "index.html": `\n    <!--cifras--><p>¿Buscas una cifra concreta? Mira el cálculo completo para ${C.BRUTOS.filter((b) => b % 5000 === 0).map((b) => `<a href="/sueldo-neto/${b}/">${T.num(b)} €</a>`).join(", ")} o consulta la <a href="/sueldo-neto/">tabla de sueldos netos de 15.000 a 60.000 €</a>.</p>`,
  "neto-a-bruto/index.html": `\n    <!--cifras--><p>Cálculo completo para cobrar ${C.NETOS.map((n) => `<a href="/neto-a-bruto/${n}/">${T.num(n)} €</a>`).join(", ")} netos al mes.</p>`
};
const ANCLA_CIFRA = { "index.html": /id="ejemplos">[\s\S]*?<\/table><\/div>/, "neto-a-bruto/index.html": /id="tabla">[\s\S]*?<\/table><\/div>/ };

for (const [ruta, fuentes] of Object.entries(EXISTENTES)) {
  const f = path.join(RAIZ, ruta);
  let h = fs.readFileSync(f, "utf8");
  h = h.replace(/<nav>[\s\S]*?<\/nav>/, T.NAV);
  if (!h.includes("gc.zgo.at/count.js")) h = h.replace("</head>", T.ESTADISTICAS + "\n</head>");
  h = h.replace(/(<footer><div class="wrap">\s*)<p>[\s\S]*?<\/p>/, "$1" + T.PIE_ENLACES);
  if (fuentes) {
    h = h.replace(/\n\s*<p class="updated">[\s\S]*?<\/p>/, "");
    h = h.replace(/(<p class="lead">[\s\S]*?<\/p>)/, "$1\n  " + T.actualizado(fuentes));
    h = h.replace(/\n\s*<section class="sources" id="fuentes">[\s\S]*?<\/section>/, "");
    h = h.replace(/(\n\s*<\/article>)/, "\n\n    " + T.bloqueFuentes(fuentes) + "$1");
  }
  if (ENLACES_CIFRA[ruta]) {
    h = h.replace(/\n\s*<!--cifras--><p>[\s\S]*?<\/p>/, "");
    h = h.replace(ANCLA_CIFRA[ruta], (m) => m + ENLACES_CIFRA[ruta]);
  }
  fs.writeFileSync(f, h);
}

// 3. Sitemap
const urls = ["/", "/neto-a-bruto/", "/finiquito/", "/paro/", "/paga-extra/", "/baja-medica/", "/cuota-autonomos/", "/sueldo-neto/",
  ...C.BRUTOS.map((b) => `/sueldo-neto/${b}/`), ...C.NETOS.map((n) => `/neto-a-bruto/${n}/`),
  "/como-calculamos/", "/insertar/"];
escribir("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${T.DOMINIO}${u}</loc><lastmod>${T.ACTUALIZADO_ISO}</lastmod></url>`).join("\n")}
</urlset>
`);

console.log(`Generadas ${C.BRUTOS.length + C.NETOS.length + 7} páginas; sitemap con ${urls.length} direcciones.`);
