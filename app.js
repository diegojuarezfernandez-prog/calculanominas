(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  var pct = function (n) { return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %"; };

  function leer() {
    var pagas = document.querySelector('input[name="pagas"]:checked');
    var contrato = document.querySelector('input[name="contrato"]:checked');
    return {
      bruto: parseFloat(String($("bruto").value).replace(/\./g, "").replace(",", ".")) || 0,
      pagas: pagas ? +pagas.value : 14,
      temporal: contrato ? contrato.value === "temporal" : false,
      edad: +$("edad").value || 30,
      situacion: +$("situacion").value,
      hijos: +$("hijos").value || 0,
      hijosMenores3: +$("menores3").value || 0,
      hijosPorEntero: !$("compartidos").checked,
      discapacidad: $("discapacidad").value
    };
  }

  function pintar() {
    var o = leer();
    var r = SueldoNeto.calcular(o);
    var mensualTxt = eur.format(r.netoMensual);
    $("neto-mes").textContent = mensualTxt;
    $("neto-sub").textContent = "al mes en " + r.pagas + " pagas · " + eur.format(r.netoAnual) + " netos al año";
    $("k-irpf").textContent = pct(r.tipoIrpf);
    $("k-extra").textContent = r.pagas === 14 ? eur.format(r.pagaExtra) : "Prorrateadas";
    $("d-bruto").textContent = eur.format(r.bruto);
    $("d-ss").textContent = "− " + eur.format(r.ssAnual);
    $("d-irpf").textContent = "− " + eur.format(r.irpfAnual);
    $("d-neto").textContent = eur.format(r.netoAnual);
    $("d-ss-tipo").textContent = "(" + pct(r.ssTipo) + ")";
    $("solid-row").hidden = !(r.solidaridad > 0);
    $("d-solid").textContent = eur.format(r.solidaridad);
    $("exento").hidden = !r.exento;
    var b = r.bruto || 1;
    $("b-neto").style.width = (r.netoAnual / b * 100) + "%";
    $("b-irpf").style.width = (r.irpfAnual / b * 100) + "%";
    $("b-ss").style.width = (r.ssAnual / b * 100) + "%";
    $("extra-row").hidden = r.pagas !== 14;
    $("menores3").max = o.hijos;
    $("compartidos-wrap").hidden = !(o.hijos > 0);
    $("menores3-wrap").hidden = !(o.hijos > 0);
  }

  document.querySelectorAll("#calc input, #calc select").forEach(function (el) {
    el.addEventListener("input", pintar);
    el.addEventListener("change", pintar);
  });
  pintar();
})();
