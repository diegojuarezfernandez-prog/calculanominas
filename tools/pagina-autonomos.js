/* Página /cuota-autonomos/ */
"use strict";
const CA = require("../cuota-autonomos/cuota.js");
const T = require("./plantilla.js");
const { num, eur, eur2, pct } = T;

const ANIO_AUT = 2026;

function cuotaAutonomos() {
  const path = "/cuota-autonomos/";
  const titulo = "Calculadora de cuota de autónomos 2026 y 2027: cuánto pagarás según tus ingresos";
  const desc = "Calcula gratis tu cuota de autónomos en 2026 según tus rendimientos netos: tramo, base mínima y máxima, cuota mensual y anual, tarifa plana y autónomos societarios. Con la previsión para 2027.";
  const fix = (v) => (v === 1166.69 ? 1166.70 : v);
  const filas = CA.TABLA.map((t, i) => {
    const desde = i === 0 ? "Hasta 670 €" : (t[0] === Infinity ? "Más de 6.000 €" : `${eur2(fix(CA.TABLA[i - 1][0]))} – ${eur2(fix(t[0]))}`);
    return `      <tr><td>${t[3] === "reducida" ? "Reducida" : "General"} ${t[4]}</td><td>${desde}</td><td>${eur2(t[1])}</td><td>${eur2(t[1] * 0.315)}</td><td>${eur2(t[2] * 0.315)}</td></tr>`;
  }).join("\n");
  const ej = [9000, 15000, 20000, 24000, 30000, 40000, 60000].map((b) => {
    const r = CA.calcular({ beneficio: b });
    return `      <tr><td>${eur(b)}</td><td>${eur(r.rendMes)}</td><td>${r.tabla === "reducida" ? "Reducida" : "General"} ${r.tramo}</td><td><strong>${eur2(r.cuotaMin)}</strong></td><td>${eur(r.cuotaMin * 12)}</td></tr>`;
  }).join("\n");
  const e = CA.calcular({ beneficio: 24000 });
  const e27 = CA.calcular({ beneficio: 24000, anio: 2027 });
  const soc = CA.calcular({ beneficio: 15000, societario: true });
  const tp = CA.calcular({ beneficio: 15000, tarifaPlana: true });
  const preguntas = [
    ["¿Cuánto paga un autónomo en 2026?", `Depende de sus rendimientos netos: desde ${eur2(CA.calcular({ beneficio: 0 }).cuotaMin)} al mes con rendimientos de hasta 670 € al mes hasta ${eur2(CA.calcular({ beneficio: 100000 }).cuotaMin)} al mes por la base mínima del último tramo (más de 6.000 € al mes). Los nuevos autónomos pueden pagar la tarifa plana de 80 € (${eur2(tp.cuotaTarifa)} con el MEI) durante el primer año.`],
    ["¿Cuál será la cuota de autónomos en 2027?", `La tabla de tramos de 2027 todavía no está aprobada. Lo único seguro es que el MEI sube del 0,9 % al 1 %, así que el tipo pasa del 31,5 % al 31,6 %. Si se mantienen los tramos de 2026, la cuota mínima subirá unos céntimos o pocos euros: por ejemplo, de ${eur2(e.cuotaMin)} a ${eur2(e27.cuotaMin)} al mes con 24.000 € de beneficio.`],
    ["¿Qué son los rendimientos netos para la cuota?", "Tus ingresos menos los gastos deducibles de la actividad (sin contar la propia cuota de autónomos), menos un 7 % por gastos genéricos (un 3 % si eres autónomo societario). Lo que queda, dividido entre 12, decide tu tramo."],
    ["¿Qué pasa si gano más o menos de lo que preví?", "La Seguridad Social compara tu cotización con los rendimientos reales que declaras en la renta y regulariza: si cotizaste de menos, te reclama la diferencia; si cotizaste de más, te la devuelve. Puedes cambiar tu previsión hasta seis veces al año."],
    ["¿Cuánto paga un autónomo societario en 2026?", `Su base mínima es de 1.424,40 € al mes (la del grupo 7 del Régimen General), así que su cuota mínima es de ${eur2(soc.cuotaMin)} al mes. Durante 2026 puede cotizar provisionalmente por 1.000 €, pero en la regularización tendrá que pagar la diferencia.`],
    ["¿Me conviene cotizar por más de la base mínima?", "Pagas más cada mes, pero mejoras tus prestaciones: la baja, el cese de actividad y, sobre todo, la pensión de jubilación, que se calcula con las bases por las que has cotizado."]
  ];
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: "Calculadora de cuota de autónomos 2026", applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, inLanguage: "es-ES" },
    T.faqJson(preguntas)] };

  return `${T.head({ title: titulo, desc, path, jsonld, ogTitle: "Calculadora de cuota de autónomos 2026 y 2027" })}
${T.cabecera()}

<main class="wrap">
  <h1>Calculadora de cuota de autónomos ${ANIO_AUT}</h1>
  <p class="lead">Descubre cuánto pagarás de cuota a la Seguridad Social según lo que ganas: tu tramo, la cuota mínima y máxima que puedes elegir y si te corresponde la tarifa plana. Incluye una previsión para 2027.</p>
  ${T.actualizado(["reta", "ss"])}

  <div class="grid">
    <form class="card" id="calc" onsubmit="return false" aria-label="Datos para el cálculo">
      <label for="beneficio">Beneficio anual previsto (€) <span class="hint">(ingresos menos gastos, sin restar la cuota de autónomos)</span></label>
      <input id="beneficio" type="text" inputmode="decimal" value="24000" autocomplete="off">

      <label>Año</label>
      <div class="seg">
        <label><input type="radio" name="anio" value="2026" checked><span>2026</span></label>
        <label><input type="radio" name="anio" value="2027"><span>2027 (previsión)</span></label>
      </div>

      <label for="tipo">Tipo de autónomo</label>
      <select id="tipo">
        <option value="fisico" selected>Persona física (autónomo individual)</option>
        <option value="societario">Societario o familiar colaborador</option>
      </select>

      <label class="check"><input id="tarifa" type="checkbox"> Estoy en el periodo de tarifa plana (primer año o prórroga)</label>
    </form>

    <section class="card result" aria-live="polite">
      <div class="sub" style="margin:0 0 4px" id="titulo-cuota">Cuota mensual mínima</div>
      <div class="big" id="cuota">—</div>
      <div class="sub" id="cuota-sub"></div>
      <div class="kpis">
        <div class="kpi"><small>Tu tramo</small><b id="k-tramo">—</b></div>
        <div class="kpi"><small>Rendimiento neto al mes</small><b id="k-rend">—</b></div>
      </div>
      <table class="desglose">
        <tr><td>Rendimiento neto anual <span class="hint" id="d-ded"></span></td><td id="d-rend"></td></tr>
        <tr><td>Base de cotización mínima</td><td id="d-bmin"></td></tr>
        <tr><td>Base de cotización máxima</td><td id="d-bmax"></td></tr>
        <tr><td>Tipo de cotización</td><td id="d-tipo"></td></tr>
        <tr><td>Cuota por la base mínima</td><td id="d-cmin"></td></tr>
        <tr><td>Cuota por la base máxima</td><td id="d-cmax"></td></tr>
        <tr class="total"><td id="d-total-txt">Cuota al año</td><td id="d-total"></td></tr>
      </table>
      <p class="note" id="aviso"></p>
      <p class="note">Cálculo orientativo. La cuota definitiva se ajusta en la regularización anual con tus rendimientos reales.</p>
    </section>
  </div>

  <article>
    <h2>Cómo se calcula la cuota de autónomos</h2>
    <p>Desde 2023 los autónomos cotizan según sus <strong>ingresos reales</strong>. El cálculo tiene cuatro pasos:</p>
    <ol>
      <li><strong>Rendimiento neto:</strong> ingresos de la actividad menos los gastos deducibles, sin restar la cuota de autónomos.</li>
      <li><strong>Deducción por gastos genéricos:</strong> se resta un 7 % (un 3 % si eres autónomo societario o familiar colaborador).</li>
      <li><strong>Tramo:</strong> el resultado, dividido entre 12, te sitúa en uno de los 15 tramos de la tabla. Cada tramo tiene una base de cotización mínima y una máxima, y tú eliges la base dentro de ese margen.</li>
      <li><strong>Cuota:</strong> a la base elegida se le aplica el tipo de cotización: el <strong>31,5 % en 2026</strong> (28,3 % contingencias comunes, 1,3 % profesionales, 0,9 % cese de actividad, 0,1 % formación y 0,9 % MEI).</li>
    </ol>
    <p>Al principio del año comunicas tu previsión de rendimientos y puedes cambiarla hasta seis veces. Cuando Hacienda conoce tus rendimientos reales, la Seguridad Social regulariza: te devuelve lo que pagaste de más o te reclama lo que falte.</p>

    <h2>Tabla de tramos y cuotas de autónomos 2026</h2>
    <p>En 2026 se mantienen los tramos de 2025, con la base máxima de los dos últimos tramos actualizada a 5.101,20 €. Cuotas con el tipo del 31,5 %:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Tramo</th><th>Rendimiento neto al mes</th><th>Base mínima</th><th>Cuota mínima</th><th>Cuota máxima</th></tr>
${filas}
    </table></div>

    <h2>Cuánto paga un autónomo según lo que gana</h2>
    <p>Autónomo persona física que cotiza por la base mínima de su tramo en 2026:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Beneficio anual</th><th>Rendimiento neto al mes</th><th>Tramo</th><th>Cuota al mes</th><th>Cuota al año</th></tr>
${ej}
    </table></div>
    <p>Ejemplo: con ${eur(24000)} de beneficio, el rendimiento neto es ${eur2(e.rendAnual)} (tras restar el 7 %), ${eur2(e.rendMes)} al mes. Eso cae en el tramo ${e.tramo} de la tabla general, con una base mínima de ${eur2(e.baseMin)}: cuota de <strong>${eur2(e.cuotaMin)} al mes</strong>.</p>

    <h2>Cuota de autónomos en 2027</h2>
    <p>A día de hoy <strong>no hay tabla de tramos aprobada para 2027</strong>. Lo único fijado por ley es que el Mecanismo de Equidad Intergeneracional (MEI) sube del 0,9 % al 1 %, así que el tipo pasará del 31,5 % al 31,6 %. La opción «2027 (previsión)» de la calculadora usa los tramos de 2026 con ese tipo. En cuanto se publique la tabla oficial, actualizaremos la calculadora.</p>

    <h2>Tarifa plana para nuevos autónomos</h2>
    <p>Si te das de alta por primera vez (o no has sido autónomo en los dos últimos años, tres si ya disfrutaste de la tarifa plana), pagas <strong>80 € al mes durante los primeros 12 meses</strong>, más el MEI: unos ${eur2(tp.cuotaTarifa)} en 2026. Puedes prorrogarla otros 12 meses si tus rendimientos netos del año son inferiores al salario mínimo (${eur(17094)} en 2026). Hay que pedirla al darse de alta, y la prórroga, antes de que termine el primer año.</p>

    <h2>Autónomos societarios y familiares colaboradores</h2>
    <p>Desde 2026 su base mínima es de <strong>1.424,40 € al mes</strong> (antes, 1.000 €), lo que supone una cuota mínima de ${eur2(soc.cuotaMin)}. Durante 2026 pueden seguir cotizando provisionalmente por 1.000 €, pero en la regularización tendrán que pagar la diferencia. Además, solo pueden deducir un 3 % por gastos genéricos.</p>

    <h2>Preguntas frecuentes</h2>
${T.faqHtml(preguntas)}

    <p>¿Trabajas también por cuenta ajena? Calcula tu nómina con la <a href="/">calculadora de sueldo neto</a>.</p>

    ${T.bloqueFuentes(["reta", "rdl13", "ss"])}
  </article>
</main>

${T.pie("Tramos y tipos de cotización de autónomos de 2026; previsión de 2027 pendiente de la tabla oficial. Los resultados son orientativos.")}

<script src="cuota.js"></script>
<script>
(function(){
  "use strict";
  var eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",useGrouping:"always"});
  var num=function(v){return parseFloat(String(v).replace(/\\./g,"").replace(",","."))||0};
  var $=function(i){return document.getElementById(i)};
  function pintar(){
    var anio=+document.querySelector('input[name="anio"]:checked').value;
    var r=CuotaAutonomos.calcular({beneficio:num($("beneficio").value),anio:anio,societario:$("tipo").value==="societario",tarifaPlana:$("tarifa").checked});
    $("titulo-cuota").textContent=r.tarifaPlana?"Cuota mensual con tarifa plana":"Cuota mensual mínima";
    $("cuota").textContent=eur.format(r.cuota);
    $("cuota-sub").textContent=r.tarifaPlana?"80 € más el MEI · después pasarías a "+eur.format(r.cuotaMin)+"/mes":"puedes elegir pagar hasta "+eur.format(r.cuotaMax)+" al mes";
    $("k-tramo").textContent=(r.tabla==="reducida"?"Reducida ":"General ")+r.tramo;
    $("k-rend").textContent=eur.format(r.rendMes);
    $("d-ded").textContent="(−"+r.deduccion+" % gastos genéricos)";
    $("d-rend").textContent=eur.format(r.rendAnual);
    $("d-bmin").textContent=eur.format(r.baseMin);
    $("d-bmax").textContent=eur.format(r.baseMax);
    $("d-tipo").textContent=r.tipo.toLocaleString("es-ES",{minimumFractionDigits:2})+" %";
    $("d-cmin").textContent=eur.format(r.cuotaMin);
    $("d-cmax").textContent=eur.format(r.cuotaMax);
    $("d-total").textContent=eur.format(r.cuotaAnual);
    var av=[];
    if(r.provisional) av.push("2027 es una previsión: la tabla oficial de tramos aún no está aprobada.");
    if(r.tarifaPlana) av.push(r.prorrogaTarifa?"Con este rendimiento (menos de "+eur.format(r.smi)+" al año) podrías pedir la prórroga de la tarifa plana.":"Con este rendimiento no podrías prorrogar la tarifa plana después del primer año.");
    if($("tipo").value==="societario") av.push("Base mínima de autónomo societario: 1.424,40 € (en 2026 puedes cotizar provisionalmente por 1.000 € y regularizar después).");
    $("aviso").textContent=av.join(" "); $("aviso").hidden=!av.length;
  }
  document.querySelectorAll("#calc input,#calc select").forEach(function(el){el.addEventListener("input",pintar);el.addEventListener("change",pintar)});
  pintar();
})();
</script>
</body>
</html>
`;
}

module.exports = { cuotaAutonomos };
