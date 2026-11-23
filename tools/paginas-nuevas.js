/* Páginas nuevas: /paga-extra/, /baja-medica/, /como-calculamos/, /insertar/ y /widget/sueldo-neto/ */
"use strict";
const SN = require("../calc.js");
const PE = require("../paga-extra/paga.js");
const BJ = require("../baja-medica/baja.js");
const T = require("./plantilla.js");
const { num, eur, eur2, pct, ANIO, ACTUALIZADO } = T;

const FECHA_JS = `var eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
  var pct=function(v){return v.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" %"};
  var num=function(v){return parseFloat(String(v).replace(/\\./g,"").replace(",","."))||0};
  var $=function(i){return document.getElementById(i)};`;

// ---------- Paga extra ----------
function pagaExtra() {
  const path = "/paga-extra/";
  const titulo = `Calculadora de paga extra de Navidad ${ANIO}: cuánto cobrarás neto`;
  const desc = `Calcula gratis tu paga extra de Navidad ${ANIO}: el importe bruto según los días trabajados, la retención de IRPF y lo que te llega neto. Con ejemplos y si empezaste a trabajar este año.`;
  const ej = [18000, 22000, 25000, 30000, 35000, 40000, 50000].map((b) => {
    const r = PE.calcular({ bruto: b }, SN);
    return `      <tr><td>${eur(b)}</td><td>${eur2(r.pagaCompleta)}</td><td>${pct(r.tipoIrpf)}</td><td><strong>${eur2(r.neto)}</strong></td></tr>`;
  }).join("\n");
  const ejA = PE.calcular({ bruto: 25000, inicio: `${ANIO}-04-01` }, SN);
  const ejS = PE.calcular({ bruto: 25000, inicio: `${ANIO}-10-01`, devengo: "semestral" }, SN);
  const preguntas = [
    ["¿Cuándo se cobra la paga extra de Navidad?", "Lo fija tu convenio colectivo. Lo más habitual es cobrarla antes del 20 o del 22 de diciembre, junto con la nómina de diciembre o por separado. El Estatuto de los Trabajadores solo obliga a que una de las dos pagas extra se cobre en Navidad."],
    ["¿La paga extra tiene descuentos de Seguridad Social?", "No en el momento de cobrarla: su cotización ya se reparte entre las nóminas de todo el año. Por eso en la paga extra solo se descuenta la retención de IRPF, y el neto es mayor que en una nómina normal."],
    ["¿Por qué me retienen el mismo IRPF en la paga extra?", "Porque la retención se calcula sobre tu sueldo anual completo, pagas extra incluidas, y se aplica el mismo porcentaje a todas las nóminas. Si en diciembre cambia tu situación, la empresa puede regularizar el porcentaje."],
    ["Si empecé a trabajar este año, ¿cobro la paga entera?", `No, solo la parte proporcional a los días que has trabajado dentro del periodo en que se genera. Por ejemplo, con un sueldo de 25.000 € y alta el 1 de abril, la paga de Navidad (anual) sería de ${eur2(ejA.bruto)} brutos.`],
    ["¿Qué pasa si tengo las pagas prorrateadas?", "Si cobras en 12 pagas, las extras ya van repartidas en cada nómina mensual y en diciembre no recibes ninguna paga adicional."],
    ["¿La baja médica afecta a la paga extra?", "Depende del convenio. Durante la baja la prestación ya incluye la parte proporcional de las pagas, así que muchos convenios descuentan esos días de la paga extra y otros la pagan completa. Revisa el tuyo."]
  ];
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: `Calculadora de paga extra de Navidad ${ANIO}`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, inLanguage: "es-ES" },
    T.faqJson(preguntas)] };

  return `${T.head({ title: titulo, desc, path, jsonld, ogTitle: `Calculadora de paga extra de Navidad ${ANIO}` })}
${T.cabecera()}

<main class="wrap">
  <h1>Calculadora de paga extra de Navidad ${ANIO}</h1>
  <p class="lead">Descubre cuánto vas a cobrar en la paga de Navidad: el importe bruto según los días que has trabajado este año, la retención de IRPF y lo que te llegará neto a la cuenta.</p>
  ${T.actualizado(["aeat", "et"])}

  <div class="grid">
    <form class="card" id="calc" onsubmit="return false" aria-label="Datos para el cálculo">
      <label for="bruto">Salario bruto anual (14 pagas, €)</label>
      <input id="bruto" type="text" inputmode="decimal" value="25000" autocomplete="off">

      <label for="devengo">¿Cómo se genera la paga en tu convenio?</label>
      <select id="devengo">
        <option value="anual" selected>Anual: de enero a diciembre (lo más habitual)</option>
        <option value="semestral">Semestral: de julio a diciembre</option>
      </select>

      <label for="inicio">Fecha de alta en la empresa <span class="hint">(solo si empezaste en ${ANIO})</span></label>
      <input id="inicio" type="date" min="${ANIO}-01-01" max="${ANIO}-12-31">

      <div class="row">
        <div><label for="hijos">Hijos <span class="hint">(menores de 25)</span></label><input id="hijos" type="number" min="0" max="10" value="0"></div>
        <div><label for="contrato">Contrato</label><select id="contrato"><option value="indefinido">Indefinido</option><option value="temporal">Temporal</option></select></div>
      </div>

      <details class="more">
        <summary>Más opciones</summary>
        <label for="importe">Importe de la paga completa, si lo sabes (€) <span class="hint">(por defecto, el salario anual entre 14)</span></label>
        <input id="importe" type="text" inputmode="decimal" placeholder="Opcional">
        <label for="sinderecho">Días que no generan paga <span class="hint">(permisos sin sueldo, excedencia, huelga)</span></label>
        <input id="sinderecho" type="number" min="0" max="365" value="0">
        <label for="situacion">Situación familiar</label>
        <select id="situacion">
          <option value="3" selected>Soltero/a, o casado/a con cónyuge con ingresos</option>
          <option value="2">Casado/a, cónyuge con ingresos menores de 1.500 €/año</option>
          <option value="1">Familia monoparental (soltero/a con hijos a cargo)</option>
        </select>
      </details>
    </form>

    <section class="card result" aria-live="polite">
      <div class="sub" style="margin:0 0 4px">Paga de Navidad neta</div>
      <div class="big" id="neto">—</div>
      <div class="sub" id="neto-sub"></div>
      <div class="kpis">
        <div class="kpi"><small>Retención IRPF</small><b id="k-irpf">—</b></div>
        <div class="kpi"><small>Días generados</small><b id="k-dias">—</b></div>
      </div>
      <table class="desglose">
        <tr><td>Paga completa</td><td id="d-completa"></td></tr>
        <tr><td>Parte generada <span class="hint" id="d-prop"></span></td><td id="d-bruto"></td></tr>
        <tr><td>Retención de IRPF</td><td id="d-irpf"></td></tr>
        <tr><td>Seguridad Social</td><td>0,00 €</td></tr>
        <tr class="total"><td>Paga neta</td><td id="d-neto"></td></tr>
      </table>
      <p class="note" id="exento" hidden>Con este sueldo y tu situación no se te aplica retención de IRPF.</p>
      <p class="note">Cálculo orientativo. El importe exacto de la paga (si incluye complementos o antigüedad) lo fija tu convenio colectivo.</p>
    </section>
  </div>

  <article>
    <h2>Cómo se calcula la paga extra de Navidad</h2>
    <p>Todos los trabajadores por cuenta ajena tienen derecho a <strong>dos pagas extraordinarias al año</strong>, una de ellas en Navidad (artículo 31 del Estatuto de los Trabajadores). Su importe y la forma de generarla los fija el convenio colectivo, pero el cálculo siempre sigue tres pasos:</p>
    <ol>
      <li><strong>El importe de la paga completa.</strong> Normalmente es una mensualidad: el salario base más los complementos que diga tu convenio. Si tu sueldo se reparte en 14 pagas, equivale al salario bruto anual entre 14.</li>
      <li><strong>La parte que te corresponde.</strong> Si has trabajado todo el periodo de devengo, cobras la paga completa. Si no, la parte proporcional a los días trabajados. Con devengo anual el periodo va del 1 de enero al 31 de diciembre; con devengo semestral, del 1 de julio al 31 de diciembre.</li>
      <li><strong>Los descuentos.</strong> Solo la retención de IRPF, con el mismo porcentaje que en tus nóminas. No se descuenta Seguridad Social porque la cotización de las pagas ya se reparte entre los doce meses.</li>
    </ol>

    <h2>Paga de Navidad ${ANIO} según el sueldo</h2>
    <p>Persona soltera, sin hijos, contrato indefinido y año completo trabajado:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Salario bruto anual</th><th>Paga bruta</th><th>IRPF</th><th>Paga neta</th></tr>
${ej}
    </table></div>

    <h2>Ejemplo: si empezaste a trabajar este año</h2>
    <p>Marta cobra <strong>25.000 € brutos al año en 14 pagas</strong> (paga completa de ${eur2(ejA.pagaCompleta)}) y entró en la empresa el <strong>1 de abril de ${ANIO}</strong>:</p>
    <ul>
      <li>Con <strong>devengo anual</strong>, ha trabajado ${ejA.dias} de los ${ejA.diasPeriodo} días del año: ${eur2(ejA.pagaCompleta)} × ${ejA.dias} ÷ ${ejA.diasPeriodo} = <strong>${eur2(ejA.bruto)} brutos</strong>, que con una retención del ${pct(ejA.tipoIrpf)} se quedan en <strong>${eur2(ejA.neto)} netos</strong>.</li>
      <li>Si hubiera entrado el 1 de octubre y su convenio tuviera <strong>devengo semestral</strong> (julio a diciembre), habría trabajado ${ejS.dias} de ${ejS.diasPeriodo} días: <strong>${eur2(ejS.bruto)} brutos</strong> y ${eur2(ejS.neto)} netos.</li>
    </ul>

    <h2>¿12 o 14 pagas?</h2>
    <p>Si cobras en 12 pagas, la empresa te paga cada mes una parte de las extras (prorrateadas) y en diciembre no recibes nada adicional. El sueldo anual es el mismo; solo cambia cuándo lo cobras. Puedes comparar las dos opciones en la <a href="/">calculadora de sueldo neto</a>.</p>
    <p>Si dejas la empresa antes de diciembre, la parte de la paga que hayas generado se te paga en el <a href="/finiquito/">finiquito</a>.</p>

    <h2>Preguntas frecuentes</h2>
${T.faqHtml(preguntas)}

    ${T.bloqueFuentes(["et", "aeat"])}
  </article>
</main>

${T.pie(`Retenciones de IRPF de ${ANIO}. Los resultados son orientativos: el importe exacto lo fija tu convenio.`)}

<script src="/calc.js"></script>
<script src="paga.js"></script>
<script>
(function(){
  "use strict";
  ${FECHA_JS}
  function pintar(){
    var r=PagaExtra.calcular({bruto:num($("bruto").value),importePaga:num($("importe").value),devengo:$("devengo").value,
      inicio:$("inicio").value||null,diasSinDerecho:+$("sinderecho").value||0,hijos:+$("hijos").value||0,
      situacion:+$("situacion").value,temporal:$("contrato").value==="temporal"});
    $("neto").textContent=eur.format(r.neto);
    $("neto-sub").textContent=eur.format(r.bruto)+" brutos"+(r.completa?" · paga completa":"");
    $("k-irpf").textContent=pct(r.tipoIrpf);
    $("k-dias").textContent=r.dias+" de "+r.diasPeriodo;
    $("d-completa").textContent=eur.format(r.pagaCompleta);
    $("d-prop").textContent="("+r.dias+"/"+r.diasPeriodo+" días)";
    $("d-bruto").textContent=eur.format(r.bruto);
    $("d-irpf").textContent="− "+eur.format(r.irpf);
    $("d-neto").textContent=eur.format(r.neto);
    $("exento").hidden=!r.exento;
  }
  document.querySelectorAll("#calc input,#calc select").forEach(function(el){el.addEventListener("input",pintar);el.addEventListener("change",pintar)});
  pintar();
})();
</script>
</body>
</html>
`;
}

// ---------- Baja médica ----------
function bajaMedica() {
  const path = "/baja-medica/";
  const titulo = `Calculadora de baja médica ${ANIO}: cuánto cobro de baja`;
  const desc = `Calcula gratis cuánto cobrarás estando de baja en ${ANIO}: por enfermedad común (60 % y 75 %) o accidente de trabajo (75 %), quién te paga cada día y cuánto pierdes frente a tu sueldo.`;
  const ej = BJ.calcular({ bruto: 24000, tipo: "comun", dias: 30 });
  const ejAT = BJ.calcular({ bruto: 24000, tipo: "profesional", dias: 30 });
  const filas = ej.tramos.map((t) => `      <tr><td>Días ${t.desde}${t.hasta !== t.desde ? "–" + t.hasta : ""}</td><td>${t.pct} %</td><td>${t.dias} × ${t.pct ? eur2(ej.diaria * t.pct / 100) : "0 €"}</td><td>${eur2(t.importe)}</td><td>${t.paga}</td></tr>`).join("\n");
  const preguntas = [
    ["¿Cuánto se cobra de baja por enfermedad común?", "Los tres primeros días no se cobra nada (salvo que tu convenio diga otra cosa). Del día 4 al 20 se cobra el 60 % de la base reguladora y, a partir del día 21, el 75 %."],
    ["¿Y si es un accidente de trabajo?", "El día del accidente la empresa te paga el salario completo y, desde el día siguiente, cobras el 75 % de la base reguladora, sin necesidad de haber cotizado un mínimo."],
    ["¿Qué es la base reguladora de la baja?", "La base de cotización del mes anterior a la baja dividida entre 30 (si cobras por meses). Incluye la parte proporcional de las pagas extra, por eso suele ser algo mayor que tu nómina bruta mensual."],
    ["¿Quién me paga cuando estoy de baja?", "En enfermedad común, la empresa paga del día 4 al 15 y la Seguridad Social o la mutua desde el día 16, aunque normalmente lo sigues cobrando en la nómina porque la empresa lo adelanta (pago delegado)."],
    ["¿Cuántos días hay que haber cotizado?", "Para la baja por enfermedad común, 180 días en los últimos cinco años. Para el accidente de trabajo o la enfermedad profesional no se exige ningún periodo mínimo."],
    ["¿La baja tributa en el IRPF?", "Sí. La prestación por incapacidad temporal es un rendimiento del trabajo y lleva retención, y mientras estás de baja sigues cotizando a la Seguridad Social."]
  ];
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: `Calculadora de baja médica ${ANIO}`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, inLanguage: "es-ES" },
    T.faqJson(preguntas)] };

  return `${T.head({ title: titulo, desc, path, jsonld, ogTitle: `Calculadora de baja médica ${ANIO}` })}
${T.cabecera()}

<main class="wrap">
  <h1>Calculadora de baja médica ${ANIO}</h1>
  <p class="lead">Calcula cuánto cobrarás durante una baja por enfermedad o accidente: cuánto te corresponde cada día, quién te lo paga y cuánto dejas de ingresar respecto a tu sueldo.</p>
  ${T.actualizado(["it", "lgss"])}

  <div class="grid">
    <form class="card" id="calc" onsubmit="return false" aria-label="Datos para el cálculo">
      <label for="bruto">Salario bruto anual (€)</label>
      <input id="bruto" type="text" inputmode="decimal" value="24000" autocomplete="off">

      <label for="tipo">Motivo de la baja</label>
      <select id="tipo">
        <option value="comun" selected>Enfermedad común o accidente no laboral</option>
        <option value="profesional">Accidente de trabajo o enfermedad profesional</option>
      </select>

      <label for="dias">Días de baja <span class="hint">(naturales)</span></label>
      <input id="dias" type="number" min="1" max="545" value="30">

      <label class="check"><input id="complemento" type="checkbox"> Mi convenio complementa la baja hasta el 100 %</label>

      <details class="more">
        <summary>Más opciones</summary>
        <label for="base">Base de cotización del mes anterior (€) <span class="hint">(aparece en tu nómina; si la rellenas, se usa en lugar del salario)</span></label>
        <input id="base" type="text" inputmode="decimal" placeholder="Opcional">
      </details>
    </form>

    <section class="card result" aria-live="polite">
      <div class="sub" style="margin:0 0 4px">Cobrarás por la baja</div>
      <div class="big" id="total">—</div>
      <div class="sub" id="total-sub"></div>
      <div class="kpis">
        <div class="kpi"><small>Base reguladora diaria</small><b id="k-diaria">—</b></div>
        <div class="kpi"><small>Pierdes frente a tu sueldo</small><b id="k-perdida">—</b></div>
      </div>
      <table class="desglose" id="tramos"></table>
      <p class="note" id="requisito"></p>
      <p class="note">Importes brutos: a la prestación se le aplica tu retención de IRPF y la cotización a la Seguridad Social, igual que a la nómina.</p>
    </section>
  </div>

  <article>
    <h2>Cuánto se cobra de baja en ${ANIO}</h2>
    <p>La prestación por incapacidad temporal se calcula sobre la <strong>base reguladora</strong>: la base de cotización del mes anterior a la baja dividida entre 30. El porcentaje depende del motivo y de los días que lleves de baja:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Motivo</th><th>Días</th><th>Porcentaje</th><th>Quién paga</th></tr>
      <tr><td rowspan="4">Enfermedad común o accidente no laboral</td><td>1 a 3</td><td>0 %</td><td>Nadie, salvo convenio</td></tr>
      <tr><td>4 a 15</td><td>60 %</td><td>Empresa</td></tr>
      <tr><td>16 a 20</td><td>60 %</td><td>INSS o mutua</td></tr>
      <tr><td>Desde el 21</td><td>75 %</td><td>INSS o mutua</td></tr>
      <tr><td rowspan="2">Accidente de trabajo o enfermedad profesional</td><td>Día de la baja</td><td>100 % del salario</td><td>Empresa</td></tr>
      <tr><td>Desde el día siguiente</td><td>75 %</td><td>Mutua o INSS</td></tr>
    </table></div>
    <p>Aunque desde el día 16 paga la Seguridad Social o la mutua, lo normal es que lo sigas cobrando en tu nómina: la empresa lo adelanta y luego lo descuenta de sus cotizaciones (pago delegado).</p>

    <h2>Ejemplo: 30 días de baja con 24.000 € al año</h2>
    <p>Lucía cobra <strong>24.000 € brutos al año</strong>, así que su base de cotización es de ${eur2(ej.base)} al mes y su base reguladora diaria, de <strong>${eur2(ej.diaria)}</strong>. Está 30 días de baja por una gripe complicada:</p>
    <div class="scroll"><table class="tabla">
      <tr><th>Tramo</th><th>%</th><th>Cálculo</th><th>Importe</th><th>Paga</th></tr>
${filas}
      <tr><td><strong>Total</strong></td><td></td><td></td><td><strong>${eur2(ej.prestacion)}</strong></td><td></td></tr>
    </table></div>
    <p>Trabajando habría generado ${eur2(ej.normal)} en esos 30 días (con la parte de las pagas extra), así que la baja le cuesta unos <strong>${eur(ej.perdida)} brutos</strong>. Si hubiera sido un accidente de trabajo, cobraría ${eur2(ejAT.prestacion)} y perdería solo ${eur(ejAT.perdida)}.</p>

    <h2>El complemento del convenio</h2>
    <p>Muchos convenios colectivos obligan a la empresa a completar la prestación hasta el 100 % del salario, a veces desde el primer día y otras solo a partir de cierto día o para bajas con hospitalización. Busca en tu convenio la palabra «incapacidad temporal» o «complemento». Si lo tienes, marca la casilla de la calculadora.</p>

    <h2>Baja médica, vacaciones y despido</h2>
    <p>Si la baja coincide con tus vacaciones, tienes derecho a disfrutarlas después, aunque haya terminado el año. Y si te despiden estando de baja, la empresa debe pagarte el <a href="/finiquito/">finiquito</a> con las vacaciones que no hayas podido disfrutar. Si la baja se alarga y te quedas sin trabajo, puedes calcular tu <a href="/paro/">prestación por desempleo</a>.</p>

    <h2>Preguntas frecuentes</h2>
${T.faqHtml(preguntas)}

    ${T.bloqueFuentes(["it", "lgss"])}
  </article>
</main>

${T.pie(`Porcentajes y base máxima de cotización de ${ANIO}. Los resultados son orientativos.`)}

<script src="baja.js"></script>
<script>
(function(){
  "use strict";
  ${FECHA_JS}
  function pintar(){
    var r=Baja.calcular({bruto:num($("bruto").value),baseMensual:num($("base").value),tipo:$("tipo").value,
      dias:+$("dias").value||0,complemento:$("complemento").checked});
    $("total").textContent=eur.format(r.total);
    $("total-sub").textContent="brutos por "+r.dias+" días de baja"+(r.complementoEmpresa>0?" (con el complemento de la empresa)":"");
    $("k-diaria").textContent=eur.format(r.diaria);
    $("k-perdida").textContent=eur.format(r.perdida);
    var h="";
    r.tramos.forEach(function(t){
      h+="<tr><td>Días "+t.desde+(t.hasta!==t.desde?"–"+t.hasta:"")+" <span class=\\"hint\\">("+t.pct+" % · "+t.paga+")</span></td><td>"+eur.format(t.importe)+"</td></tr>";
    });
    if(r.complementoEmpresa>0) h+="<tr><td>Complemento del convenio</td><td>"+eur.format(r.complementoEmpresa)+"</td></tr>";
    h+="<tr class=\\"total\\"><td>Total de la baja</td><td>"+eur.format(r.total)+"</td></tr>";
    h+="<tr><td class=\\"hint\\">Salario de esos días (con pagas prorrateadas)</td><td class=\\"hint\\">"+eur.format(r.normal)+"</td></tr>";
    $("tramos").innerHTML=h;
    $("requisito").textContent=r.requisito;
    $("requisito").hidden=!r.requisito;
  }
  document.querySelectorAll("#calc input,#calc select").forEach(function(el){el.addEventListener("input",pintar);el.addEventListener("change",pintar)});
  pintar();
})();
</script>
</body>
</html>
`;
}

// ---------- Quiénes somos y cómo calculamos ----------
function comoCalculamos() {
  const path = "/como-calculamos/";
  const titulo = "Quiénes somos y cómo calculamos · CalculaNominas.es";
  const desc = "Quién está detrás de CalculaNominas.es, qué normativa y fuentes oficiales usamos en cada calculadora, cada cuánto la revisamos y qué límites tienen los cálculos.";
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "AboutPage", name: "Quiénes somos y cómo calculamos", url: T.DOMINIO + path, dateModified: T.ACTUALIZADO_ISO, inLanguage: "es-ES",
      publisher: { "@type": "Organization", name: "CalculaNominas.es", url: T.DOMINIO, founder: { "@type": "Person", name: "Diego Juárez Fernández" } } }] };
  const fu = (k) => `<a href="${T.FUENTES[k][1]}" rel="nofollow noopener" target="_blank">${T.FUENTES[k][0]}</a>`;
  return `${T.head({ title: titulo, desc, path, jsonld, ogTitle: "Quiénes somos y cómo calculamos" })}
${T.cabecera()}

<main class="wrap">
  <h1>Quiénes somos y cómo calculamos</h1>
  <p class="lead">CalculaNominas.es es un proyecto independiente para que cualquier persona pueda saber, en segundos y gratis, cuánto va a cobrar: su sueldo neto, su finiquito, su paro, su paga extra o su baja.</p>
  <p class="updated">Última revisión de la normativa: ${ACTUALIZADO}</p>

  <article style="margin-top:20px">
    <h2>Quién está detrás</h2>
    <p>La web la crea y la mantiene <strong>Diego Juárez Fernández</strong>, desde Madrid. No pertenece a ninguna empresa de nóminas, banco ni gestoría, y no vendemos nada: la web se financia con publicidad.</p>
    <p>Si encuentras un error o un caso que no cuadra con tu nómina, escríbenos a <a href="mailto:diegojuarezfernandez@gmail.com">diegojuarezfernandez@gmail.com</a>. Revisamos cada aviso.</p>

    <h2>Cómo trabajamos</h2>
    <ul>
      <li><strong>Solo fuentes oficiales.</strong> Cada parámetro (tramos de IRPF, tipos de cotización, topes del paro, días de indemnización) sale de la norma publicada en el BOE o de la documentación de la Agencia Tributaria, la Seguridad Social o el SEPE.</li>
      <li><strong>Revisión semanal.</strong> Cada semana comprobamos si se ha publicado alguna norma que cambie los cálculos. Solo aplicamos cambios aprobados y en vigor; las propuestas y anteproyectos no.</li>
      <li><strong>Cambios revisados antes de publicarse.</strong> Cualquier actualización se prueba con ejemplos y se revisa antes de llegar a la web, y la fecha de actualización aparece en cada calculadora.</li>
      <li><strong>Tus datos no salen de tu navegador.</strong> Todos los cálculos se hacen en tu dispositivo: no enviamos ni guardamos los importes que introduces.</li>
    </ul>

    <h2>Qué usa cada calculadora</h2>
    <h3><a href="/">Sueldo neto</a> y <a href="/neto-a-bruto/">neto a bruto</a></h3>
    <p>Aplicamos el <strong>algoritmo oficial de cálculo de retenciones de IRPF de ${ANIO}</strong> de la Agencia Tributaria: gastos deducibles, reducción por rendimientos del trabajo (hasta 7.302 €), escala de retención (19, 24, 30, 37, 45 y 47 %), mínimo personal y familiar (5.550 € más hijos, edad y discapacidad) y límites sin retención. Las cotizaciones del trabajador son las de ${ANIO}: 6,50 % con contrato indefinido y 6,55 % con temporal, con la base máxima de 5.101,20 € al mes y la cuota de solidaridad. La calculadora de neto a bruto busca el salario bruto que, aplicando exactamente lo mismo, da el neto que pides.</p>
    <p>Fuentes: ${fu("aeat")}; ${fu("ss")}.</p>

    <h3><a href="/finiquito/">Finiquito e indemnización</a></h3>
    <p>Calculamos el salario de los días trabajados, las vacaciones generadas y no disfrutadas y la parte proporcional de las pagas extra. La indemnización sigue el Estatuto de los Trabajadores: 33 días por año en el despido improcedente (45 días por el tiempo anterior al 12 de febrero de 2012, con sus topes), 20 días en el despido objetivo y 12 días al terminar un contrato temporal.</p>
    <p>Fuente: ${fu("et")}.</p>

    <h3><a href="/paro/">Paro</a></h3>
    <p>La prestación es el 70 % de la base reguladora los primeros 180 días y el 60 % después, con los mínimos y máximos que publica el SEPE sobre el IPREM de ${ANIO} (600 € al mes). La duración sale de la tabla oficial de días cotizados en los últimos seis años.</p>
    <p>Fuentes: ${fu("sepe")}; ${fu("lgss")}.</p>

    <h3><a href="/paga-extra/">Paga extra</a></h3>
    <p>La parte de la paga generada según los días trabajados en el periodo de devengo (anual o semestral, según el convenio), con la retención de IRPF que corresponde a tu sueldo anual. No se descuenta Seguridad Social porque su cotización ya se prorratea cada mes.</p>
    <p>Fuentes: ${fu("et")}; ${fu("aeat")}.</p>

    <h3><a href="/baja-medica/">Baja médica</a></h3>
    <p>Los porcentajes de la prestación por incapacidad temporal (60 % del día 4 al 20 y 75 % desde el 21 en enfermedad común; 75 % desde el día siguiente en accidente de trabajo) sobre la base de cotización del mes anterior, con la base máxima de ${ANIO}.</p>
    <p>Fuentes: ${fu("it")}; ${fu("lgss")}.</p>

    <h2>Límites de los cálculos</h2>
    <ul>
      <li>Los resultados son <strong>orientativos</strong>. Tu nómina real depende de tu convenio, de tus complementos y de los datos que tenga tu empresa.</li>
      <li>El IRPF se calcula para <strong>territorio común</strong>: no incluye las normas forales del País Vasco ni de Navarra.</li>
      <li>La retención no es el impuesto final: la cuota real del IRPF se ajusta en la declaración de la renta.</li>
      <li>Ante una decisión importante (firmar un finiquito, reclamar un despido), consulta con un abogado laboralista, una gestoría o un sindicato.</li>
    </ul>
  </article>
</main>

${T.pie()}
</body>
</html>
`;
}

// ---------- Insertar en tu web ----------
const CODIGO_WIDGET = `<iframe src="https://calculanominas.es/widget/sueldo-neto/" title="Calculadora de sueldo neto 2026" width="100%" height="460" style="border:0;max-width:480px" loading="lazy"></iframe>
<p style="font-size:13px;max-width:480px">Calculadora de <a href="https://calculanominas.es/">sueldo neto</a> de CalculaNominas.es</p>`;

function insertar() {
  const path = "/insertar/";
  const titulo = "Pon gratis la calculadora de sueldo neto en tu web · CalculaNominas.es";
  const desc = "Inserta gratis en tu blog, web de empleo o gestoría una calculadora de sueldo neto 2026 siempre actualizada. Copia y pega el código.";
  const esc = CODIGO_WIDGET.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `${T.head({ title: titulo, desc, path, ogTitle: "Pon gratis la calculadora de sueldo neto en tu web" })}
${T.cabecera()}

<main class="wrap">
  <h1>Pon la calculadora de sueldo neto en tu web</h1>
  <p class="lead">¿Tienes un blog de empleo o finanzas, una gestoría o una web de ofertas de trabajo? Añade gratis nuestra calculadora de sueldo neto. Se actualiza sola cada vez que cambia la normativa, sin que tengas que hacer nada.</p>

  <div class="grid">
    <section class="card">
      <h2 style="margin-top:0;font-size:1.15rem">1. Copia este código</h2>
      <textarea id="codigo" class="code" rows="7" readonly>${esc}</textarea>
      <p><button class="btn" id="copiar" type="button">Copiar código</button> <span class="hint" id="copiado" hidden>Copiado</span></p>
      <h2 style="font-size:1.15rem">2. Pégalo en tu página</h2>
      <p>En WordPress, añade un bloque «HTML personalizado» y pega el código. En otras plataformas, pégalo donde quieras que aparezca la calculadora.</p>
      <p class="note">Es gratis y sin registro. Solo te pedimos que mantengas el enlace de debajo de la calculadora.</p>
    </section>
    <section>
      <div class="sub" style="margin:0 0 8px">Así se verá:</div>
      <iframe src="/widget/sueldo-neto/" title="Calculadora de sueldo neto 2026" width="100%" height="460" style="border:0;max-width:480px"></iframe>
    </section>
  </div>

  <article>
    <h2>Preguntas frecuentes</h2>
    <h3>¿Tiene publicidad?</h3>
    <p>No. La calculadora insertada no muestra anuncios.</p>
    <h3>¿Se actualiza sola?</h3>
    <p>Sí. Usa el mismo cálculo que <a href="/">nuestra calculadora principal</a>, así que cuando cambian el IRPF o las cotizaciones se actualiza en tu web automáticamente.</p>
    <h3>¿Guarda datos de mis visitantes?</h3>
    <p>No. El cálculo se hace en el navegador de cada persona y no se envía ni se guarda nada.</p>
    <h3>¿Puedo cambiar el tamaño?</h3>
    <p>Sí, ajusta los valores <code>width</code> y <code>height</code> del código. Recomendamos una altura mínima de 440 píxeles.</p>
    <p>¿Te interesa otra calculadora (finiquito, paro, paga extra) o una versión con tus colores? Escríbenos a <a href="mailto:diegojuarezfernandez@gmail.com">diegojuarezfernandez@gmail.com</a>.</p>
  </article>
</main>

${T.pie()}
<script>
document.getElementById("copiar").addEventListener("click",function(){
  var t=document.getElementById("codigo"); t.select();
  var ok=function(){document.getElementById("copiado").hidden=false};
  if(navigator.clipboard){navigator.clipboard.writeText(t.value).then(ok,function(){document.execCommand("copy");ok()})}
  else{document.execCommand("copy");ok()}
});
</script>
</body>
</html>
`;
}

function widget() {
  return `${T.head({ title: `Calculadora de sueldo neto ${ANIO} · CalculaNominas.es`, desc: `Calculadora de sueldo neto ${ANIO}.`, path: "/widget/sueldo-neto/", noindex: true, ads: false,
    extra: "\n<style>body{background:transparent}.w{max-width:480px;padding:2px}.w .card{padding:18px}.w .big{font-size:2.1rem}.w .brand{font-size:.8rem;margin-top:12px;color:var(--muted)}</style>" })}
<div class="w">
  <form class="card" id="calc" onsubmit="return false">
    <strong>Calculadora de sueldo neto ${ANIO}</strong>
    <label for="bruto">Salario bruto anual (€)</label>
    <input id="bruto" type="text" inputmode="decimal" value="25000" autocomplete="off">
    <div class="row">
      <div><label for="pagas">Pagas</label><select id="pagas"><option value="14">14 pagas</option><option value="12">12 pagas</option></select></div>
      <div><label for="hijos">Hijos</label><input id="hijos" type="number" min="0" max="10" value="0"></div>
    </div>
    <div class="result" style="margin-top:16px">
      <div class="sub" style="margin:0">Sueldo neto al mes</div>
      <div class="big" id="neto">—</div>
      <div class="sub" id="neto-sub" style="margin-bottom:0"></div>
    </div>
    <p class="brand">Cálculo con el IRPF y la Seguridad Social de ${ANIO} · <a href="https://calculanominas.es/" target="_blank" rel="noopener">CalculaNominas.es</a> · <a href="https://calculanominas.es/?utm_source=widget" target="_blank" rel="noopener">más opciones</a></p>
  </form>
</div>
<script src="/calc.js"></script>
<script>
(function(){
  "use strict";
  ${FECHA_JS}
  function pintar(){
    var r=SueldoNeto.calcular({bruto:num($("bruto").value),pagas:+$("pagas").value,hijos:+$("hijos").value||0,situacion:3,edad:30});
    $("neto").textContent=eur.format(r.netoMensual);
    $("neto-sub").textContent="en "+r.pagas+" pagas · IRPF "+pct(r.tipoIrpf)+" · "+eur.format(r.netoAnual)+" netos al año";
  }
  document.querySelectorAll("#calc input,#calc select").forEach(function(el){el.addEventListener("input",pintar);el.addEventListener("change",pintar)});
  pintar();
})();
</script>
</body>
</html>
`;
}

module.exports = { pagaExtra, bajaMedica, comoCalculamos, insertar, widget };
