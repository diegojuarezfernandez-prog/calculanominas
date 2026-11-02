/* Prestación contributiva por desempleo 2026 (SEPE). IPREM 2026 = 600 €/mes. */
(function (global) {
  "use strict";
  var IPREM = 600, IPREM16 = IPREM * 7 / 6; // 700 € con prorrata de pagas
  var BASE_MAX = 5101.20;
  var TABLA = [ // [días cotizados desde, días de prestación]
    [2160, 720], [1980, 660], [1800, 600], [1620, 540], [1440, 480], [1260, 420],
    [1080, 360], [900, 300], [720, 240], [540, 180], [360, 120]
  ];
  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }

  function duracion(diasCotizados) {
    for (var i = 0; i < TABLA.length; i++) if (diasCotizados >= TABLA[i][0]) return TABLA[i][1];
    return 0;
  }

  /* o: baseMensual (media de las bases de cotización de los últimos 180 días, €/mes),
        diasCotizados (últimos 6 años), hijos (número), parcial (% de jornada, 100 = completa) */
  function calcular(o) {
    var base = Math.min(Math.max(0, +o.baseMensual || 0), BASE_MAX);
    var hijos = Math.max(0, Math.floor(+o.hijos || 0));
    var jornada = Math.min(100, Math.max(1, +o.parcial || 100)) / 100;
    var maxP = (hijos === 0 ? 1.75 : hijos === 1 ? 2.0 : 2.25) * IPREM16 * jornada;
    var minP = (hijos === 0 ? 0.80 : 1.07) * IPREM16 * jornada;
    var dias = duracion(+o.diasCotizados || 0);
    var meses = dias / 30;

    function tramo(pct) {
      var bruto = base * pct, tope = "";
      if (bruto > maxP) { bruto = maxP; tope = "máximo"; }
      else if (bruto < minP) { bruto = minP; tope = "mínimo"; }
      var ss = base * 0.047; // cotización a cargo del trabajador (4,70 % de la base reguladora)
      if (ss > bruto) ss = 0;
      return { bruto: r2(bruto), ss: r2(ss), neto: r2(bruto - ss), tope: tope };
    }
    var t1 = tramo(0.70), t2 = tramo(0.60);
    var m1 = Math.min(meses, 6), m2 = Math.max(0, meses - 6);
    var totalBruto = t1.bruto * m1 + t2.bruto * m2;
    var totalNeto = t1.neto * m1 + t2.neto * m2;
    return {
      derecho: dias > 0, dias: dias, meses: meses, base: r2(base),
      max: r2(maxP), min: r2(minP), primeros: t1, despues: t2,
      totalBruto: r2(totalBruto), totalNeto: r2(totalNeto)
    };
  }

  var api = { calcular: calcular, duracion: duracion, TABLA: TABLA };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Paro = api;
})(this);
