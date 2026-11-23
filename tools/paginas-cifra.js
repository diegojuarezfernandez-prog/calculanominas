/* Páginas por cifra concreta:
   /sueldo-neto/<bruto>/      "¿Cuánto es 30.000 € brutos en neto en 2026?"
   /neto-a-bruto/<neto>/      "¿Cuánto es 1.500 € netos en bruto en 2026?"
   /sueldo-neto/              tabla con todas las cifras */
"use strict";
const SN = require("../calc.js");
const T = require("./plantilla.js");
const { num, eur, eur2, pct, ANIO } = T;

const BRUTOS = [15000, 16000, 18000, 20000, 21000, 22000, 24000, 25000, 26000, 27000, 28000,
  30000, 32000, 35000, 38000, 40000, 42000, 45000, 50000, 55000, 60000];
const NETOS = [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2200, 2500, 3000];

const base = (extra) => Object.assign({ pagas: 14, hijos: 0, situacion: 3, edad: 30 }, extra || {});
const calc = (bruto, extra) => SN.calcular(Object.assign(base(extra), { bruto }));

// Bruto anual (redondeado al euro hacia arriba) que deja un neto mensual dado: misma búsqueda que la web
function brutoPara(neto, extra) {
  let lo = 0, hi = Math.max(1000, neto * 30);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (calc(mid, extra).netoMensual < neto) lo = mid; else hi = mid;
  }
  return calc(Math.ceil(hi), extra);
}

function tramoMarginal(baseLiq) {
  return Math.round((SN.escala(baseLiq + 1) - SN.escala(baseLiq)) * 100);
}

// ---------- Bruto → neto ----------
function paginaBruto(b, i) {
  const r14 = calc(b), r12 = calc(b, { pagas: 12 });
  const h1 = calc(b, { hijos: 1 }), h2 = calc(b, { hijos: 2 }), tmp = calc(b, { temporal: true });
  const sube = calc(b + 1000);
  const masNeto = sube.netoAnual - r14.netoAnual;
  const path = `/sueldo-neto/${b}/`;
  const titulo = `¿Cuánto es ${num(b)} € brutos en neto en ${ANIO}?`;
  const desc = `${num(b)} € brutos al año son ${eur(r14.netoMensual)} netos al mes en 14 pagas o ${eur(r12.netoMensual)} en 12 pagas en ${ANIO} (soltero, sin hijos, contrato indefinido). Con tabla por hijos y cálculo paso a paso.`;
  const cuotaEscala = SN.escala(r14.base) - SN.escala(r14.minimo);

  let pasos;
  if (r14.exento) {
    pasos = `<ol>
      <li><strong>Seguridad Social:</strong> el 6,50 % de ${eur(b)} son ${eur2(r14.ssAnual)} al año (${eur2(r14.ssMensual)} al mes).</li>
      <li><strong>IRPF:</strong> una persona soltera sin hijos no tiene retención si cobra 15.876 € brutos al año o menos. Con ${eur(b)} estás por debajo de ese límite, así que <strong>no te retienen IRPF</strong>.</li>
      <li><strong>Neto anual:</strong> ${num(b)} − ${eur2(r14.ssAnual)} = <strong>${eur2(r14.netoAnual)}</strong>.</li>
    </ol>`;
  } else {
    const limitado = cuotaEscala - r14.cuota > 1;
    pasos = `<ol>
      <li><strong>Seguridad Social:</strong> el 6,50 % de ${eur(b)} son ${eur2(r14.ssAnual)} al año (${eur2(r14.ssMensual)} al mes)${r14.solidaridad > 0 ? `, de los que ${eur2(r14.solidaridad)} son la cuota de solidaridad por superar la base máxima` : ""}.</li>
      <li><strong>Rendimiento neto:</strong> ${num(b)} − ${eur2(r14.ssAnual)} − ${eur(r14.otrosGastos)} de gastos generales${r14.reduccion > 0 ? ` − ${eur2(r14.reduccion)} de reducción por rendimientos del trabajo` : ""} = <strong>${eur2(r14.base)}</strong>. Esa es la base de retención.</li>
      <li><strong>Cuota:</strong> se aplica la escala a la base y se resta lo que corresponde al mínimo personal de ${eur(r14.minimo)}${limitado ? `. El resultado se limita al 43 % de lo que tu sueldo supera el límite sin retención (15.876 €), y queda en` : ": quedan"} <strong>${eur2(r14.cuota)}</strong> al año.</li>
      <li><strong>Tipo de retención:</strong> ${eur2(r14.cuota)} ÷ ${num(b)} = <strong>${pct(r14.tipoIrpf)}</strong>, es decir, ${eur2(r14.irpfAnual)} al año (${eur2(r14.irpfAnual / 14)} en cada paga).</li>
      <li><strong>Neto anual:</strong> ${num(b)} − ${eur2(r14.ssAnual)} − ${eur2(r14.irpfAnual)} = <strong>${eur2(r14.netoAnual)}</strong>.</li>
    </ol>`;
  }

  const prev = BRUTOS[i - 1], next = BRUTOS[i + 1];
  const preguntas = [
    [`¿Cuánto es ${num(b)} € brutos al año en neto al mes?`,
      `En ${ANIO}, una persona soltera sin hijos con contrato indefinido cobra unos <strong>${eur(r14.netoMensual)} netos al mes en 14 pagas</strong> (más dos pagas extra de ${eur(r14.pagaExtra)}) o <strong>${eur(r12.netoMensual)} al mes en 12 pagas</strong>. En total, ${eur(r14.netoAnual)} netos al año.`],
    [`¿Cuánto IRPF me retienen con ${num(b)} € brutos?`,
      r14.exento ? `Nada: con ${num(b)} € brutos al año una persona soltera sin hijos está por debajo del límite de 15.876 € y no tiene retención de IRPF en ${ANIO}.`
        : `Un <strong>${pct(r14.tipoIrpf)}</strong> si eres soltero o soltera sin hijos: ${eur(r14.irpfAnual)} al año. Con un hijo baja al ${pct(h1.tipoIrpf)} y con dos, al ${pct(h2.tipoIrpf)}.`],
    [`¿Cuánto es ${num(b)} € brutos al mes?`,
      `${num(b)} € brutos al año son ${eur2(b / 14)} brutos al mes en 14 pagas o ${eur2(b / 12)} en 12 pagas. Lo que llega a tu cuenta es menos, porque se restan la Seguridad Social y el IRPF.`]
  ];

  const jsonld = { "@context": "https://schema.org", "@graph": [
    T.migas([["Inicio", "/"], ["Tabla de sueldos netos", "/sueldo-neto/"], [`${num(b)} € brutos`, path]]),
    T.faqJson(preguntas)] };

  return `${T.head({ title: titulo, desc, path, jsonld })}
${T.cabecera()}

<main class="wrap">
  <p class="crumbs"><a href="/">Inicio</a> › <a href="/sueldo-neto/">Tabla de sueldos netos</a> › ${num(b)} €</p>
  <h1>${titulo}</h1>
  <p class="lead">Con un salario de <strong>${num(b)} € brutos al año</strong> cobras <strong>${eur(r14.netoMensual)} netos al mes en 14 pagas</strong> o <strong>${eur(r12.netoMensual)} en 12 pagas</strong>, si eres soltero o soltera, sin hijos y con contrato indefinido.</p>
  ${T.actualizado(["aeat", "ss"])}

  <div class="grid">
    <section class="card result">
      <div class="sub" style="margin:0 0 4px">Sueldo neto en 14 pagas</div>
      <div class="big">${eur(r14.netoMensual)}<span class="per">/mes</span></div>
      <div class="sub">más 2 pagas extra de ${eur(r14.pagaExtra)} · ${eur(r14.netoAnual)} netos al año</div>
      <div class="kpis">
        <div class="kpi"><small>Retención IRPF</small><b>${pct(r14.tipoIrpf)}</b></div>
        <div class="kpi"><small>En 12 pagas</small><b>${eur(r12.netoMensual)}/mes</b></div>
      </div>
      <table class="desglose">
        <tr><td>Salario bruto anual</td><td>${eur2(b)}</td></tr>
        <tr><td>Seguridad Social <span class="hint">(${pct(r14.ssTipo)})</span></td><td>− ${eur2(r14.ssAnual)}</td></tr>
        <tr><td>Retención de IRPF</td><td>− ${eur2(r14.irpfAnual)}</td></tr>
        <tr class="total"><td>Neto anual</td><td>${eur2(r14.netoAnual)}</td></tr>
      </table>
    </section>
    <section class="card">
      <h2 style="margin-top:0;font-size:1.15rem">¿Tu caso es distinto?</h2>
      <p>Si tienes hijos, otra situación familiar, una discapacidad o un contrato temporal, el resultado cambia. Calcúlalo con tus datos exactos:</p>
      <p><a class="btn" href="/?bruto=${b}">Calcular mi sueldo neto con ${num(b)} €</a></p>
      <p class="note">También puedes hacer el camino inverso con la <a href="/neto-a-bruto/">calculadora de neto a bruto</a>.</p>
    </section>
  </div>

  <article>
    <h2>${num(b)} € brutos en 12 y en 14 pagas</h2>
    <div class="scroll"><table class="tabla">
      <tr><th></th><th>14 pagas</th><th>12 pagas</th></tr>
      <tr><td>Bruto al mes</td><td>${eur2(b / 14)}</td><td>${eur2(b / 12)}</td></tr>
      <tr><td>Neto al mes</td><td><strong>${eur2(r14.netoMensual)}</strong></td><td><strong>${eur2(r12.netoMensual)}</strong></td></tr>
      <tr><td>Cada paga extra (neto)</td><td>${eur2(r14.pagaExtra)}</td><td>Prorrateadas</td></tr>
      <tr><td>Neto al año</td><td>${eur2(r14.netoAnual)}</td><td>${eur2(r12.netoAnual)}</td></tr>
    </table></div>
    <p>El sueldo neto anual es el mismo: con 12 pagas las extras van repartidas en cada nómina, así que cobras más cada mes pero no tienes pagas en verano ni en Navidad.</p>

    <h2>Con hijos o con contrato temporal</h2>
    <div class="scroll"><table class="tabla">
      <tr><th>Situación (14 pagas)</th><th>IRPF</th><th>Neto al mes</th><th>Neto al año</th></tr>
      <tr><td>Soltero/a sin hijos, indefinido</td><td>${pct(r14.tipoIrpf)}</td><td>${eur(r14.netoMensual)}</td><td>${eur(r14.netoAnual)}</td></tr>
      <tr><td>Con 1 hijo</td><td>${pct(h1.tipoIrpf)}</td><td>${eur(h1.netoMensual)}</td><td>${eur(h1.netoAnual)}</td></tr>
      <tr><td>Con 2 hijos</td><td>${pct(h2.tipoIrpf)}</td><td>${eur(h2.netoMensual)}</td><td>${eur(h2.netoAnual)}</td></tr>
      <tr><td>Contrato temporal, sin hijos</td><td>${pct(tmp.tipoIrpf)}</td><td>${eur(tmp.netoMensual)}</td><td>${eur(tmp.netoAnual)}</td></tr>
    </table></div>
    <p>Los hijos rebajan la retención porque aumentan el mínimo personal y familiar. Con un contrato temporal la Seguridad Social es algo mayor (6,55 % en lugar de 6,50 %).</p>

    <h2>Cálculo paso a paso</h2>
    <p>Así se pasa de ${num(b)} € brutos a neto en ${ANIO}, para una persona soltera sin hijos con contrato indefinido:</p>
    ${pasos}
    ${r14.exento ? "" : `<p>Con este sueldo tu base cae en el tramo del <strong>${tramoMarginal(r14.base)} %</strong> de la escala, pero ese porcentaje solo se aplica a la parte más alta de la base. Por eso el tipo real que te retienen (${pct(r14.tipoIrpf)}) es mucho menor.</p>`}

    <h2>¿Cuánto ganarías con una subida?</h2>
    <p>Si tu sueldo pasara de ${num(b)} € a ${num(b + 1000)} € brutos al año, cobrarías <strong>${eur(masNeto)} netos más al año</strong> (${eur(masNeto / 14)} más en cada paga): te quedarías con el ${num(masNeto / 10)} % de la subida. El resto se va en Seguridad Social e IRPF.</p>

    <h2>Preguntas frecuentes</h2>
${T.faqHtml(preguntas)}

    <h2>Otras cifras</h2>
    <p class="chips">${prev ? `<a href="/sueldo-neto/${prev}/">← ${num(prev)} €</a>` : ""}${next ? `<a href="/sueldo-neto/${next}/">${num(next)} € →</a>` : ""}<a href="/sueldo-neto/">Ver la tabla completa</a></p>

    ${T.bloqueFuentes(["aeat", "ss"])}
  </article>
</main>

${T.pie("Cálculo orientativo para territorio común (no incluye País Vasco ni Navarra), con las retenciones de IRPF y las cotizaciones de " + ANIO + ".")}
</body>
</html>
`;
}

// ---------- Neto → bruto ----------
function paginaNeto(n, i) {
  const r14 = brutoPara(n), r12 = brutoPara(n, { pagas: 12 });
  const h1 = brutoPara(n, { hijos: 1 }), h2 = brutoPara(n, { hijos: 2 }), tmp = brutoPara(n, { temporal: true });
  const mas = brutoPara(n + 100);
  const path = `/neto-a-bruto/${n}/`;
  const titulo = `¿Cuánto es ${num(n)} € netos en bruto en ${ANIO}?`;
  const desc = `Para cobrar ${num(n)} € netos al mes en ${ANIO} necesitas unos ${eur(r14.bruto)} brutos al año en 14 pagas o ${eur(r12.bruto)} en 12 pagas (soltero, sin hijos). Con tabla por hijos y cálculo.`;
  const prev = NETOS[i - 1], next = NETOS[i + 1];
  const preguntas = [
    [`¿Cuánto bruto son ${num(n)} € netos al mes?`,
      `En ${ANIO}, para cobrar ${num(n)} € netos al mes una persona soltera sin hijos con contrato indefinido necesita unos <strong>${eur(r14.bruto)} brutos al año en 14 pagas</strong> (${eur(r14.bruto / 14)} brutos al mes) o <strong>${eur(r12.bruto)} en 12 pagas</strong> (${eur(r12.bruto / 12)} al mes).`],
    [`¿Cuánto IRPF se paga cobrando ${num(n)} € netos?`,
      r14.exento ? `Ninguno: con ese sueldo una persona soltera sin hijos está por debajo del límite sin retención (15.876 € brutos al año).`
        : `Con ${eur(r14.bruto)} brutos al año en 14 pagas la retención es del <strong>${pct(r14.tipoIrpf)}</strong> (${eur(r14.irpfAnual)} al año), y la Seguridad Social se lleva otros ${eur(r14.ssAnual)}.`],
    [`¿Con hijos necesito menos bruto para cobrar ${num(n)} € netos?`,
      `Sí, porque los hijos reducen la retención de IRPF. Con un hijo bastan unos ${eur(h1.bruto)} brutos al año y con dos, unos ${eur(h2.bruto)} (14 pagas).`]
  ];
  const jsonld = { "@context": "https://schema.org", "@graph": [
    T.migas([["Inicio", "/"], ["Neto a bruto", "/neto-a-bruto/"], [`${num(n)} € netos`, path]]),
    T.faqJson(preguntas)] };

  return `${T.head({ title: titulo, desc, path, jsonld })}
${T.cabecera()}

<main class="wrap">
  <p class="crumbs"><a href="/">Inicio</a> › <a href="/neto-a-bruto/">Neto a bruto</a> › ${num(n)} € netos</p>
  <h1>${titulo}</h1>
  <p class="lead">Para cobrar <strong>${num(n)} € netos al mes</strong> necesitas unos <strong>${eur(r14.bruto)} brutos al año en 14 pagas</strong> o <strong>${eur(r12.bruto)} en 12 pagas</strong>, si eres soltero o soltera, sin hijos y con contrato indefinido.</p>
  ${T.actualizado(["aeat", "ss"])}

  <div class="grid">
    <section class="card result">
      <div class="sub" style="margin:0 0 4px">Bruto anual necesario (14 pagas)</div>
      <div class="big">${eur(r14.bruto)}</div>
      <div class="sub">${eur2(r14.bruto / 14)} brutos al mes · ${num(n)} € netos en cada paga normal y ${eur(r14.pagaExtra)} en las extras</div>
      <div class="kpis">
        <div class="kpi"><small>Retención IRPF</small><b>${pct(r14.tipoIrpf)}</b></div>
        <div class="kpi"><small>En 12 pagas</small><b>${eur(r12.bruto)}</b></div>
      </div>
      <table class="desglose">
        <tr><td>Salario bruto anual</td><td>${eur2(r14.bruto)}</td></tr>
        <tr><td>Seguridad Social</td><td>− ${eur2(r14.ssAnual)}</td></tr>
        <tr><td>Retención de IRPF</td><td>− ${eur2(r14.irpfAnual)}</td></tr>
        <tr class="total"><td>Neto anual</td><td>${eur2(r14.netoAnual)}</td></tr>
      </table>
    </section>
    <section class="card">
      <h2 style="margin-top:0;font-size:1.15rem">Calcula tu caso exacto</h2>
      <p>Si tienes hijos, otra situación familiar o un contrato temporal, el bruto necesario cambia:</p>
      <p><a class="btn" href="/neto-a-bruto/?neto=${n}">Calcular el bruto para ${num(n)} € netos</a></p>
      <p class="note">¿Tienes ya una oferta en bruto? Pásala a neto con la <a href="/">calculadora de sueldo neto</a>.</p>
    </section>
  </div>

  <article>
    <h2>${num(n)} € netos al mes según tu situación</h2>
    <div class="scroll"><table class="tabla">
      <tr><th>Situación</th><th>Bruto anual</th><th>Bruto al mes</th><th>IRPF</th></tr>
      <tr><td>Soltero/a sin hijos, 14 pagas</td><td><strong>${eur(r14.bruto)}</strong></td><td>${eur(r14.bruto / 14)}</td><td>${pct(r14.tipoIrpf)}</td></tr>
      <tr><td>Soltero/a sin hijos, 12 pagas</td><td><strong>${eur(r12.bruto)}</strong></td><td>${eur(r12.bruto / 12)}</td><td>${pct(r12.tipoIrpf)}</td></tr>
      <tr><td>Con 1 hijo, 14 pagas</td><td>${eur(h1.bruto)}</td><td>${eur(h1.bruto / 14)}</td><td>${pct(h1.tipoIrpf)}</td></tr>
      <tr><td>Con 2 hijos, 14 pagas</td><td>${eur(h2.bruto)}</td><td>${eur(h2.bruto / 14)}</td><td>${pct(h2.tipoIrpf)}</td></tr>
      <tr><td>Contrato temporal, 14 pagas</td><td>${eur(tmp.bruto)}</td><td>${eur(tmp.bruto / 14)}</td><td>${pct(tmp.tipoIrpf)}</td></tr>
    </table></div>
    <p>Fíjate en la diferencia entre 12 y 14 pagas: en 14 pagas necesitas más bruto al año porque, además de los 12 meses a ${num(n)} €, cobras dos pagas extra. Por eso, al comparar ofertas, pregunta siempre en cuántas pagas se reparte el sueldo.</p>

    <h2>Comprobación: de ${eur(r14.bruto)} brutos a ${num(n)} € netos</h2>
    <ol>
      <li><strong>Seguridad Social:</strong> ${eur2(r14.ssAnual)} al año (${eur2(r14.ssMensual)} al mes).</li>
      <li><strong>IRPF:</strong> ${r14.exento ? "sin retención, porque el sueldo no supera el límite de 15.876 €." : `retención del ${pct(r14.tipoIrpf)}, ${eur2(r14.irpfAnual)} al año.`}</li>
      <li><strong>Neto anual:</strong> ${eur2(r14.netoAnual)}, que en 14 pagas son ${eur2(r14.netoMensual)} al mes y dos extras de ${eur2(r14.pagaExtra)}.</li>
    </ol>
    <p>Para cobrar 100 € netos más al mes (${num(n + 100)} €) necesitarías unos <strong>${eur(mas.bruto - r14.bruto)} brutos más al año</strong>.</p>

    <h2>Preguntas frecuentes</h2>
${T.faqHtml(preguntas)}

    <h2>Otras cifras</h2>
    <p class="chips">${prev ? `<a href="/neto-a-bruto/${prev}/">← ${num(prev)} € netos</a>` : ""}${next ? `<a href="/neto-a-bruto/${next}/">${num(next)} € netos →</a>` : ""}<a href="/sueldo-neto/#neto-a-bruto">Ver todas</a></p>

    ${T.bloqueFuentes(["aeat", "ss"])}
  </article>
</main>

${T.pie("Cálculo orientativo para territorio común (no incluye País Vasco ni Navarra), con las retenciones de IRPF y las cotizaciones de " + ANIO + ".")}
</body>
</html>
`;
}

// ---------- Índice ----------
function paginaIndice() {
  const path = "/sueldo-neto/";
  const titulo = `Tabla de sueldos netos ${ANIO}: de 15.000 a 60.000 € brutos`;
  const desc = `Cuánto se cobra en neto con cada salario bruto en ${ANIO}, de 15.000 a 60.000 € al año, en 12 y 14 pagas. Y cuánto bruto necesitas para cobrar de 1.000 a 3.000 € netos al mes.`;
  const filas = BRUTOS.map((b) => {
    const r14 = calc(b), r12 = calc(b, { pagas: 12 });
    return `      <tr><td><a href="/sueldo-neto/${b}/">${num(b)} €</a></td><td>${pct(r14.tipoIrpf)}</td><td>${eur(r14.netoMensual)}</td><td>${eur(r12.netoMensual)}</td><td>${eur(r14.netoAnual)}</td></tr>`;
  }).join("\n");
  const filasN = NETOS.map((n) => {
    const r14 = brutoPara(n), r12 = brutoPara(n, { pagas: 12 });
    return `      <tr><td><a href="/neto-a-bruto/${n}/">${num(n)} €</a></td><td>${eur(r14.bruto)}</td><td>${eur(r12.bruto)}</td></tr>`;
  }).join("\n");
  const jsonld = { "@context": "https://schema.org", "@graph": [T.migas([["Inicio", "/"], ["Tabla de sueldos netos", path]])] };
  return `${T.head({ title: titulo, desc, path, jsonld })}
${T.cabecera()}

<main class="wrap">
  <p class="crumbs"><a href="/">Inicio</a> › Tabla de sueldos netos</p>
  <h1>Tabla de sueldos netos ${ANIO}</h1>
  <p class="lead">Cuánto se cobra en neto con cada salario bruto anual, y cuánto bruto hace falta para cobrar un neto concreto. Pulsa en cualquier cifra para ver el cálculo completo, con hijos, contrato temporal y paso a paso.</p>
  ${T.actualizado(["aeat", "ss"])}

  <article style="margin-top:20px">
    <h2>De bruto a neto</h2>
    <p>Persona soltera, sin hijos y con contrato indefinido:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Bruto anual</th><th>IRPF</th><th>Neto al mes (14 pagas)</th><th>Neto al mes (12 pagas)</th><th>Neto al año</th></tr>
${filas}
    </table></div>
    <p>¿No está tu cifra? Usa la <a href="/">calculadora de sueldo neto</a> con tus datos.</p>

    <h2 id="neto-a-bruto">De neto a bruto</h2>
    <p>Bruto anual que necesitas para cobrar cada sueldo neto al mes (soltero/a, sin hijos, indefinido):</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Neto al mes</th><th>Bruto anual (14 pagas)</th><th>Bruto anual (12 pagas)</th></tr>
${filasN}
    </table></div>
    <p>Para otras cantidades, usa la <a href="/neto-a-bruto/">calculadora de neto a bruto</a>.</p>

    ${T.bloqueFuentes(["aeat", "ss"])}
  </article>
</main>

${T.pie("Cálculo orientativo para territorio común (no incluye País Vasco ni Navarra), con las retenciones de IRPF y las cotizaciones de " + ANIO + ".")}
</body>
</html>
`;
}

module.exports = { BRUTOS, NETOS, calc, brutoPara, paginaBruto, paginaNeto, paginaIndice };
