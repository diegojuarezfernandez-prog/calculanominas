/* Prestación por incapacidad temporal (baja médica) 2026, Régimen General.
   Enfermedad común o accidente no laboral: días 1-3 sin prestación, días 4-20 el 60 % y desde el día 21
   el 75 % de la base reguladora. Días 4-15 los paga la empresa; desde el 16, el INSS o la mutua
   (normalmente a través de la empresa, en pago delegado).
   Accidente de trabajo o enfermedad profesional: el día de la baja, salario íntegro a cargo de la empresa;
   desde el día siguiente, el 75 %.
   Base reguladora diaria: base de cotización del mes anterior / 30 (salario mensual), que incluye
   la parte proporcional de las pagas extra. */
(function (global) {
  "use strict";
  var BASE_MAX = 5101.20;
  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }

  /* opciones:
     bruto: salario bruto anual (€), o baseMensual: base de cotización del mes anterior (€)
     tipo: "comun" | "profesional"
     dias: días naturales de baja
     complemento: true si el convenio complementa hasta el 100 % del salario */
  function calcular(o) {
    var base = +o.baseMensual > 0 ? +o.baseMensual : (+o.bruto || 0) / 12;
    base = Math.min(Math.max(0, base), BASE_MAX);
    var diaria = base / 30;
    var dias = Math.max(0, Math.floor(+o.dias || 0));
    var profesional = o.tipo === "profesional";
    var tramos = [];

    function tramo(desde, hasta, pct, paga, nota) {
      var d = Math.min(hasta, dias) - desde + 1;
      if (d <= 0) return;
      tramos.push({ desde: desde, hasta: Math.min(hasta, dias), dias: d, pct: pct, paga: paga,
        importe: r2(diaria * pct / 100 * d), nota: nota || "" });
    }
    if (profesional) {
      tramo(1, 1, 100, "Empresa", "salario del día de la baja");
      tramo(2, Infinity, 75, "Mutua o INSS");
    } else {
      tramo(1, 3, 0, "—", "sin prestación salvo convenio");
      tramo(4, 15, 60, "Empresa");
      tramo(16, 20, 60, "INSS o mutua");
      tramo(21, Infinity, 75, "INSS o mutua");
    }
    var prestacion = 0;
    tramos.forEach(function (t) { prestacion += t.importe; });
    var normal = diaria * dias;
    var total = o.complemento ? normal : prestacion;
    return {
      base: r2(base), diaria: r2(diaria), dias: dias, tramos: tramos,
      prestacion: r2(prestacion), complementoEmpresa: r2(total - prestacion),
      total: r2(total), normal: r2(normal), perdida: r2(normal - total),
      requisito: profesional ? "" : "Necesitas 180 días cotizados en los últimos 5 años."
    };
  }

  var api = { calcular: calcular, BASE_MAX: BASE_MAX };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Baja = api;
})(this);
