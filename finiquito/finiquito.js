/* Cálculo de finiquito e indemnización (Estatuto de los Trabajadores, normativa vigente 2026). */
(function (global) {
  "use strict";
  var DIA = 86400000;
  var REFORMA_2012 = Date.UTC(2012, 1, 12); // 12-02-2012

  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }
  function parse(s) { var p = String(s).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function diasIncl(a, b) { return b < a ? 0 : Math.round((b - a) / DIA) + 1; }

  // Meses de servicio, redondeando hacia arriba la fracción de mes (art. 56 y 53 ET: prorrateo por meses)
  function mesesServicio(a, b) {
    if (b < a) return 0;
    var da = new Date(a), db = new Date(b + DIA); // fin inclusivo
    var m = (db.getUTCFullYear() - da.getUTCFullYear()) * 12 + (db.getUTCMonth() - da.getUTCMonth());
    if (db.getUTCDate() > da.getUTCDate()) m += 1;
    return Math.max(0, m);
  }

  /* o: inicio, fin (YYYY-MM-DD), bruto (anual), pagas (12|14), vacAnuales, vacDisfrutadas,
        mesCobrado (bool), tipo, preavisoFalta (días) */
  function calcular(o) {
    var ini = parse(o.inicio), fin = parse(o.fin);
    if (!(fin >= ini) || !(o.bruto > 0)) return null;
    var bruto = +o.bruto, pagas = +o.pagas === 12 ? 12 : 14;
    var mensual = bruto / pagas;
    var diario = mensual / 30;          // salario diario ordinario
    var diarioIndem = bruto / 365;      // salario diario con prorrata de pagas, para la indemnización

    var dFin = new Date(fin), anio = dFin.getUTCFullYear();
    var ene1 = Date.UTC(anio, 0, 1);
    var desdeAnio = Math.max(ene1, ini);
    var diasAnio = diasIncl(desdeAnio, fin);
    var diasEnAnio = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0 ? 366 : 365;

    // 1. Salario de los días trabajados del último mes
    var diasMes = o.mesCobrado ? 0 : diasIncl(Math.max(Date.UTC(anio, dFin.getUTCMonth(), 1), ini), fin);
    var salarioMes = diasMes * diario;

    // 2. Vacaciones generadas y no disfrutadas (días naturales)
    var vacGeneradas = (+o.vacAnuales || 30) * diasAnio / diasEnAnio;
    var vacPendientes = vacGeneradas - (+o.vacDisfrutadas || 0);
    var vacaciones = vacPendientes * diario;

    // 3. Parte proporcional de pagas extra (solo si no están prorrateadas)
    var extraNavidad = 0, extraVerano = 0, diasNav = 0, diasVer = 0;
    if (pagas === 14) {
      diasNav = diasAnio;
      extraNavidad = mensual * diasNav / diasEnAnio;
      var jul1 = dFin.getUTCMonth() >= 6 ? Date.UTC(anio, 6, 1) : Date.UTC(anio - 1, 6, 1);
      diasVer = diasIncl(Math.max(jul1, ini), fin);
      extraVerano = mensual * diasVer / 365;
    }

    // 4. Indemnización
    var meses = mesesServicio(ini, fin), diasIndem = 0, nota = "";
    switch (o.tipo) {
      case "temporal":
        diasIndem = 12 * diasIncl(ini, fin) / 365; break;
      case "objetivo":
        diasIndem = Math.min(20 * meses / 12, 360); break;
      case "improcedente":
        if (ini < REFORMA_2012) {
          var mesesPre = mesesServicio(ini, Math.min(fin, REFORMA_2012 - DIA));
          var mesesPost = Math.max(0, meses - mesesPre);
          var pre = 45 * mesesPre / 12, post = 33 * mesesPost / 12;
          var tope = pre > 720 ? Math.min(pre, 1260) : 720;
          diasIndem = Math.min(pre + post, tope);
          nota = "Incluye el régimen anterior a la reforma de 2012 (45 días por año hasta el 11/02/2012).";
        } else {
          diasIndem = Math.min(33 * meses / 12, 720);
        }
        break;
      default: diasIndem = 0;
    }
    var indemnizacion = diasIndem * diarioIndem;

    // 5. Preaviso (15 días)
    var falta = Math.max(0, Math.min(15, +o.preavisoFalta || 0)), preaviso = 0;
    if (o.tipo === "objetivo") preaviso = falta * diarioIndem;
    else if (o.tipo === "voluntaria") preaviso = -falta * diario;

    var finiquito = salarioMes + vacaciones + extraNavidad + extraVerano + preaviso;
    return {
      diasMes: diasMes, salarioMes: r2(salarioMes),
      vacGeneradas: r2(vacGeneradas), vacPendientes: r2(vacPendientes), vacaciones: r2(vacaciones),
      diasNav: diasNav, extraNavidad: r2(extraNavidad), diasVer: diasVer, extraVerano: r2(extraVerano),
      preaviso: r2(preaviso), finiquito: r2(finiquito),
      meses: meses, diasIndem: r2(diasIndem), indemnizacion: r2(indemnizacion), notaIndem: nota,
      total: r2(finiquito + indemnizacion),
      paro: o.tipo !== "voluntaria"
    };
  }

  var api = { calcular: calcular, mesesServicio: mesesServicio };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Finiquito = api;
})(this);
