/* Cuota de autónomos (RETA) por tramos de rendimientos netos.
   2026: tablas de 2025 prorrogadas (RDL 3/2026, art. 3), con la base máxima de los tramos 11 y 12
   igualada al tope del Régimen General (5.101,20 €). Tipo 31,50 %: contingencias comunes 28,30 +
   profesionales 1,30 + cese de actividad 0,90 + formación 0,10 + MEI 0,90.
   2027: PROVISIONAL. La tabla de 2027 no está aprobada; se usa la de 2026 con el MEI al 1 % (31,60 %).
   Autónomos societarios y familiares colaboradores: deducción del 3 % (7 % el resto) y base mínima
   de 1.424,40 € en 2026 (base mínima del grupo 7 del Régimen General). */
(function (global) {
  "use strict";

  // [rendimiento neto mensual hasta (incluido), base mínima, base máxima, tabla, número de tramo]
  var TABLA = [
    [670, 653.59, 718.94, "reducida", 1],
    [900, 718.95, 900.00, "reducida", 2],
    [1166.69, 849.67, 1166.70, "reducida", 3],
    [1300, 950.98, 1300.00, "general", 1],
    [1500, 960.78, 1500.00, "general", 2],
    [1700, 960.78, 1700.00, "general", 3],
    [1850, 1143.79, 1850.00, "general", 4],
    [2030, 1209.15, 2030.00, "general", 5],
    [2330, 1274.51, 2330.00, "general", 6],
    [2760, 1356.21, 2760.00, "general", 7],
    [3190, 1437.91, 3190.00, "general", 8],
    [3620, 1519.61, 3620.00, "general", 9],
    [4050, 1601.31, 4050.00, "general", 10],
    [6000, 1732.03, 5101.20, "general", 11],
    [Infinity, 1928.10, 5101.20, "general", 12]
  ];
  var ANIOS = {
    2026: { tipo: 31.50, mei: 0.90, provisional: false, baseSocietario: 1424.40, smi: 17094 },
    2027: { tipo: 31.60, mei: 1.00, provisional: true, baseSocietario: 1424.40, smi: 17094 }
  };
  var TARIFA_PLANA = 80, BASE_MEI_TARIFA = 960.78;

  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }
  function trunc2(x) { return Math.floor(x * 100 + 1e-9) / 100; }

  function tramoDe(rendMes) {
    for (var i = 0; i < TABLA.length; i++) if (rendMes <= TABLA[i][0]) return i;
    return TABLA.length - 1;
  }

  /* opciones:
     beneficio: ingresos menos gastos del año, sin restar la cuota de autónomos (€)
     societario: true para autónomos societarios o familiares colaboradores
     anio: 2026 | 2027
     tarifaPlana: true si estás en el periodo de tarifa plana (primeros 12 meses, o su prórroga) */
  function calcular(o) {
    var a = ANIOS[o.anio] || ANIOS[2026];
    var ded = o.societario ? 3 : 7;
    var beneficio = Math.max(0, +o.beneficio || 0);
    var rendAnual = beneficio * (1 - ded / 100);
    var rendMes = rendAnual / 12;
    var i = tramoDe(rendMes), t = TABLA[i];
    var baseMin = t[1], baseMax = t[2];
    if (o.societario && baseMin < a.baseSocietario) baseMin = a.baseSocietario;
    if (baseMax < baseMin) baseMax = baseMin;
    var cuotaMin = r2(baseMin * a.tipo / 100), cuotaMax = r2(baseMax * a.tipo / 100);
    var tarifa = r2(TARIFA_PLANA + trunc2(BASE_MEI_TARIFA * a.mei / 100));
    var cuota = o.tarifaPlana ? tarifa : cuotaMin;
    return {
      anio: +o.anio === 2027 ? 2027 : 2026, provisional: a.provisional, tipo: a.tipo,
      deduccion: ded, rendAnual: r2(rendAnual), rendMes: r2(rendMes),
      indice: i, tabla: t[3], tramo: t[4], desde: i === 0 ? 0 : TABLA[i - 1][0], hasta: t[0],
      baseMin: baseMin, baseMax: baseMax, cuotaMin: cuotaMin, cuotaMax: cuotaMax,
      tarifaPlana: !!o.tarifaPlana, cuotaTarifa: tarifa,
      cuota: cuota, cuotaAnual: r2(cuota * 12),
      prorrogaTarifa: rendAnual < a.smi, smi: a.smi
    };
  }

  var api = { calcular: calcular, TABLA: TABLA, ANIOS: ANIOS, tramoDe: tramoDe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CuotaAutonomos = api;
})(this);
