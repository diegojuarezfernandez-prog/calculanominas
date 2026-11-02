/* Cálculo de sueldo neto 2026 (territorio común, España).
   IRPF: algoritmo oficial de la AEAT para retenciones 2026.
   Seguridad Social: tipos del trabajador 2026 (Régimen General). */
(function (global) {
  "use strict";

  var SS = {
    baseMaxMes: 5101.20,
    contComunes: 4.70,
    mei: 0.15,
    desempleoIndef: 1.55,
    desempleoTemp: 1.60,
    fp: 0.10,
    // Cuota de solidaridad: parte del trabajador por tramos de exceso sobre la base máxima
    solidaridad: [
      { hasta: 0.10, tipo: 0.19 },
      { hasta: 0.50, tipo: 0.21 },
      { hasta: Infinity, tipo: 0.24 }
    ]
  };

  var ESCALA = [
    [12450, 19], [20200, 24], [35200, 30], [60000, 37], [300000, 45], [Infinity, 47]
  ];

  // Límites excluyentes de retención (art. 81 RIRPF). [0 hijos, 1, 2+]
  var LIMITES = {
    1: [null, 17644, 18694],
    2: [17197, 18130, 19262],
    3: [15876, 16342, 16867]
  };

  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }
  function trunc2(x) { return Math.floor(x * 100 + 1e-9) / 100; }

  function escala(base) {
    var cuota = 0, desde = 0;
    for (var i = 0; i < ESCALA.length; i++) {
      var hasta = ESCALA[i][0], tipo = ESCALA[i][1];
      if (base <= desde) break;
      cuota += (Math.min(base, hasta) - desde) * tipo / 100;
      desde = hasta;
    }
    return cuota;
  }

  function cotizaciones(bruto, temporal) {
    var mensual = bruto / 12;
    var base = Math.min(mensual, SS.baseMaxMes);
    var tipo = SS.contComunes + SS.mei + (temporal ? SS.desempleoTemp : SS.desempleoIndef) + SS.fp;
    var ordinaria = base * tipo / 100;
    var solidaridad = 0;
    if (mensual > SS.baseMaxMes) {
      var exceso = mensual - SS.baseMaxMes, prev = 0;
      for (var i = 0; i < SS.solidaridad.length; i++) {
        var lim = SS.solidaridad[i].hasta * SS.baseMaxMes;
        var tramo = Math.min(exceso, lim) - prev;
        if (tramo > 0) solidaridad += tramo * SS.solidaridad[i].tipo / 100;
        prev = lim;
        if (exceso <= lim) break;
      }
    }
    return {
      tipo: tipo,
      mensual: r2(ordinaria + solidaridad),
      anual: r2((ordinaria + solidaridad) * 12),
      solidaridadAnual: r2(solidaridad * 12)
    };
  }

  /* opciones:
     bruto (€/año), pagas (12|14), edad, situacion (1|2|3), hijos, hijosMenores3,
     hijosPorEntero (bool), discapacidad ("no"|"33"|"33mov"|"65"), temporal (bool) */
  function calcular(o) {
    var bruto = Math.max(0, +o.bruto || 0);
    var hijos = Math.max(0, Math.floor(+o.hijos || 0));
    var menores3 = Math.min(hijos, Math.max(0, Math.floor(+o.hijosMenores3 || 0)));
    var entero = o.hijosPorEntero === false ? 0.5 : 1;
    var situacion = +o.situacion || 3;
    if (situacion === 1 && hijos === 0) situacion = 3;
    var edad = +o.edad || 30;
    var disc = o.discapacidad || "no";

    var ss = cotizaciones(bruto, !!o.temporal);
    var cot = ss.anual;

    // Otros gastos deducibles
    var otros = 2000;
    if (disc === "65" || disc === "33mov") otros += 7750;
    else if (disc === "33") otros += 3500;
    var neto0 = bruto - cot;
    if (neto0 < 0) otros = 0; else if (otros > neto0) otros = neto0;

    // Reducción por obtención de rendimientos del trabajo
    var rnt = Math.max(0, neto0);
    var red20 = 0;
    if (rnt <= 14852) red20 = 7302;
    else if (rnt <= 17673.52) red20 = 7302 - 1.75 * (rnt - 14852);
    else if (rnt < 19747.5) red20 = 2364.34 - 1.14 * (rnt - 17673.52);
    red20 = r2(red20);

    var rntRed = Math.max(0, rnt - otros - red20);
    var reducHijos = hijos > 2 ? 600 : 0;
    var base = Math.max(0, rntRed - reducHijos);

    // Mínimo personal y familiar
    var minimo = 5550;
    if (edad >= 65) minimo += 1150;
    if (edad >= 75) minimo += 1400;
    var porHijo = [2400, 2700, 4000, 4500];
    for (var i = 0; i < hijos; i++) minimo += porHijo[Math.min(i, 3)] * entero;
    minimo += menores3 * 2800 * entero;
    if (disc === "65") minimo += 9000 + 3000;
    else if (disc === "33mov") minimo += 3000 + 3000;
    else if (disc === "33") minimo += 3000;

    // Cuota de retención
    var cuota = 0, exento = false;
    var hIdx = Math.min(hijos, 2);
    var limiteExento = LIMITES[situacion][hIdx];
    if (limiteExento !== null && bruto <= limiteExento) {
      exento = true;
    } else {
      cuota = Math.max(0, escala(base) - escala(minimo));
      if (bruto <= 35200 && limiteExento !== null) {
        var limite43 = (bruto - limiteExento) * 0.43;
        if (cuota > limite43) cuota = limite43;
      }
    }

    var tipo = bruto > 0 ? trunc2(cuota / bruto * 100) : 0;
    if (!exento && o.temporal && tipo < 2) tipo = 2;
    var irpf = r2(bruto * tipo / 100);

    var pagas = +o.pagas === 14 ? 14 : 12;
    var netoAnual = r2(bruto - cot - irpf);
    var brutoPaga = bruto / pagas;
    var irpfPaga = brutoPaga * tipo / 100;
    var mensual = r2(brutoPaga - ss.mensual - irpfPaga);
    var extra = pagas === 14 ? r2(brutoPaga - irpfPaga) : 0;

    return {
      bruto: bruto, pagas: pagas,
      ssAnual: cot, ssMensual: ss.mensual, ssTipo: ss.tipo, solidaridad: ss.solidaridadAnual,
      otrosGastos: otros, reduccion: red20, base: r2(base), minimo: r2(minimo),
      cuota: r2(cuota), tipoIrpf: tipo, irpfAnual: irpf, exento: exento,
      netoAnual: netoAnual, netoMensual: mensual, pagaExtra: extra
    };
  }

  var api = { calcular: calcular, escala: escala, cotizaciones: cotizaciones };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.SueldoNeto = api;
})(this);
