/* Piezas comunes de las páginas de CalculaNominas.es (cabecera, menú, pie, fuentes).
   Las usa tools/generar.js. */
"use strict";

const ACTUALIZADO = "23 de noviembre de 2026";
const ACTUALIZADO_ISO = "2026-11-23";
const ANIO = 2026;
const DOMINIO = "https://calculanominas.es";

const FAVICON = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%231f6f50'/><text x='16' y='22' font-size='18' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'>€</text></svg>">`;

const ADSENSE = `<!-- Google AdSense -->
<meta name="google-adsense-account" content="ca-pub-2514120482306577">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2514120482306577" crossorigin="anonymous"></script>`;

// Estadísticas de visitas sin cookies (GoatCounter). Se añade a todas las páginas menos al widget.
const ESTADISTICAS = `<script data-goatcounter="https://calculanominas.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`;

const NAV =`<nav><a href="/">Sueldo neto</a><a href="/neto-a-bruto/">Neto a bruto</a><a href="/finiquito/">Finiquito</a><a href="/paro/">Paro</a><a href="/paga-extra/">Paga extra</a><a href="/baja-medica/">Baja médica</a><a href="/cuota-autonomos/">Autónomos</a></nav>`;

const PIE_ENLACES = `<p><a href="/aviso-legal.html">Aviso legal</a><a href="/privacidad.html">Privacidad</a><a href="/cookies.html">Cookies</a><a href="/como-calculamos/">Quiénes somos y cómo calculamos</a><a href="/insertar/">Pon la calculadora en tu web</a></p>`;

const FUENTES = {
  aeat: ["Agencia Tributaria: algoritmo de cálculo de las retenciones de IRPF 2026",
    "https://sede.agenciatributaria.gob.es/static_files/Sede/Programas_ayuda/Retenciones/2026/Algoritmo%20Retenciones-2026_10sept.pdf"],
  ss: ["Seguridad Social: bases y tipos de cotización 2026",
    "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537"],
  sepe: ["SEPE: cuantías anuales de las prestaciones por desempleo",
    "https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html"],
  et: ["BOE: Estatuto de los Trabajadores (texto consolidado)",
    "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430"],
  lgss: ["BOE: Ley General de la Seguridad Social (texto consolidado)",
    "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724"],
  it: ["Seguridad Social: guía de la prestación por incapacidad temporal",
    "https://www.seg-social.es/descarga/es/26112024guiacas"],
  reta: ["BOE: Real Decreto-ley 3/2026 (cotización de autónomos en 2026)",
    "https://www.boe.es/buscar/act.php?id=BOE-A-2026-2548"],
  rdl13: ["BOE: Real Decreto-ley 13/2022 (sistema de cotización por ingresos reales y tablas de tramos)",
    "https://www.boe.es/buscar/act.php?id=BOE-A-2022-12482"]
};

// Formato de números en español, con punto de miles también en 4 cifras (1.500)
const nf0 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" });
const nf2 = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
const num = (n) => nf0.format(Math.round(n));
const eur = (n) => nf0.format(Math.round(n)) + " €";
const eur2 = (n) => nf2.format(n) + " €";
const pct = (n) => nf2.format(n) + " %";

function head({ title, desc, path, ogTitle, jsonld, noindex = false, ads = true, extra = "" }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${noindex ? '<meta name="robots" content="noindex,follow">' : `<link rel="canonical" href="${DOMINIO}${path}">
<meta property="og:title" content="${ogTitle || title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${DOMINIO}${path}">`}
${FAVICON}
<link rel="stylesheet" href="/styles.css">
${ads ? ADSENSE + "\n" + ESTADISTICAS : ""}
${jsonld ? `<script type="application/ld+json">\n${JSON.stringify(jsonld)}\n</script>` : ""}${extra}
</head>
<body>`;
}

function cabecera() {
  return `<header class="top"><div class="wrap">
  <a class="logo" href="/">Calcula<span>Nominas</span>.es</a>
  ${NAV}
</div></header>`;
}

function pie(nota) {
  return `<footer><div class="wrap">
  ${PIE_ENLACES}
  <p>${nota || `Cálculos con la normativa de ${ANIO}. Los resultados son orientativos.`}</p>
</div></footer>`;
}

function actualizado(fuentes) {
  const f = fuentes.map((k) => `<a href="${FUENTES[k][1]}" rel="nofollow noopener" target="_blank">${FUENTES[k][0].split(":")[0]}</a>`);
  const lista = f.length > 1 ? f.slice(0, -1).join(", ") + " y " + f[f.length - 1] : f[0];
  return `<p class="updated">Actualizado el ${ACTUALIZADO} · Datos oficiales de ${lista} · <a href="/como-calculamos/">Cómo calculamos</a></p>`;
}

function bloqueFuentes(fuentes) {
  return `<section class="sources" id="fuentes">
      <h2>Fuentes oficiales</h2>
      <ul>
${fuentes.map((k) => `        <li><a href="${FUENTES[k][1]}" rel="nofollow noopener" target="_blank">${FUENTES[k][0]}</a></li>`).join("\n")}
      </ul>
      <p class="note">Revisamos la normativa cada semana. Última actualización: ${ACTUALIZADO}. <a href="/como-calculamos/">Cómo hacemos los cálculos</a>.</p>
    </section>`;
}

function faqJson(preguntas) {
  return {
    "@type": "FAQPage",
    mainEntity: preguntas.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } }))
  };
}

function faqHtml(preguntas) {
  return preguntas.map(([q, a]) => `    <h3>${q}</h3>\n    <p>${a}</p>`).join("\n");
}

function migas(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([nombre, ruta], i) => ({ "@type": "ListItem", position: i + 1, name: nombre, item: DOMINIO + ruta }))
  };
}

module.exports = {
  ACTUALIZADO, ACTUALIZADO_ISO, ANIO, DOMINIO, NAV, ESTADISTICAS, PIE_ENLACES, FUENTES,
  num, eur, eur2, pct, head, cabecera, pie, actualizado, bloqueFuentes, faqJson, faqHtml, migas
};
