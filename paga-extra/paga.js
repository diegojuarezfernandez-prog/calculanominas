/* Paga extra de Navidad 2026: parte generada según los días trabajados y neto tras la retención de IRPF.
   Las pagas extra no cotizan a la Seguridad Social al cobrarse, porque su cotización ya se prorratea
   en la base de cada mes. Solo se les aplica la retención de IRPF. Necesita calc.js (SueldoNeto). */
(function (global) {
  "use strict";
  var DIA = 86400000;
  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }
  function parse(s) { var p = String(s).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function diasIncl(a, b) { return b < a ? 0 : Math.round((b - a) / DIA) + 1; }

  /* opciones:
     bruto: salario bruto anual en 14 pagas (€)
     importePaga: importe de la paga completa si lo sabes (por defecto bruto / 14)
     devengo: "anual" (1 de enero a 31 de diciembre) | "semestral" (1 de julio a 31 de diciembre)
     inicio: fecha de alta "AAAA-MM-DD" si empezaste dentro del periodo (opcional)
     diasSinDerecho: días que no generan paga (permisos sin sueldo, excedencia, huelga)
     anio: año de la paga (por defecto 2026)
     y los datos personales de SueldoNeto.calcular (hijos, situacion, edad, temporal...) */
  function calcular(o, SN) {
    SN = SN || global.SueldoNeto;
    var anio = +o.anio || 2026;
    var bruto = Math.max(0, +o.bruto || 0);
    var paga = +o.importePaga > 0 ? +o.importePaga : bruto / 14;
    var semestral = o.devengo === "semestral";
    var desde = semestral ? Date.UTC(anio, 6, 1) : Date.UTC(anio, 0, 1);
    var hasta = Date.UTC(anio, 11, 31);
    var diasPeriodo = diasIncl(desde, hasta);
    var alta = o.inicio ? parse(o.inicio) : desde;
    if (isNaN(alta)) alta = desde;
    var inicioComputo = Math.max(desde, alta);
    var dias = Math.max(0, diasIncl(inicioComputo, hasta) - Math.max(0, Math.floor(+o.diasSinDerecho || 0)));
    var importe = paga * dias / diasPeriodo;

    // Retención: el tipo que corresponde al salario anual en 14 pagas
    var opts = {};
    for (var k in o) opts[k] = o[k];
    opts.bruto = bruto; opts.pagas = 14;
    var r = SN.calcular(opts);
    var tipo = r.tipoIrpf;
    var irpf = importe * tipo / 100;

    return {
      pagaCompleta: r2(paga), diasPeriodo: diasPeriodo, dias: dias,
      completa: dias >= diasPeriodo, bruto: r2(importe),
      tipoIrpf: tipo, irpf: r2(irpf), neto: r2(importe - irpf),
      exento: r.exento, netoMensualHabitual: r.netoMensual
    };
  }

  var api = { calcular: calcular };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.PagaExtra = api;
})(this);
