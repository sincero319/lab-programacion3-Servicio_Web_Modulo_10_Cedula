/**
 * Validación de Cédula de Identidad y Electoral (RD) — algoritmo módulo 10 (JCE).
 * Solo verifica formato y dígito verificador; no confirma existencia en padrón electoral.
 */

(function (global) {
  "use strict";

  function onlyDigits(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function reduceProduct(n) {
    if (n < 10) return n;
    return reduceProduct(Math.floor(n / 10) + (n % 10));
  }

  function computeCheckDigit(tenDigits) {
    var sum = 0;
    for (var i = 0; i < 10; i++) {
      var d = parseInt(tenDigits.charAt(i), 10);
      var mult = i % 2 === 0 ? 1 : 2;
      sum += reduceProduct(d * mult);
    }
    var v = (10 - (sum % 10)) % 10;
    return v;
  }

  /**
   * @param {string} raw - Cédula con o sin guiones (11 dígitos)
   * @returns {{ valid: boolean, normalized: string|null, message: string, details?: object }}
   */
  function validateCedula(raw) {
    var digits = onlyDigits(raw);
    if (digits.length !== 11) {
      return {
        valid: false,
        normalized: null,
        message:
          digits.length === 0
            ? "Ingrese los 11 dígitos de la cédula."
            : "La cédula debe tener exactamente 11 dígitos.",
      };
    }

    if (digits.slice(0, 3) === "000") {
      return {
        valid: false,
        normalized: null,
        message: "Los tres primeros dígitos no pueden ser 000.",
      };
    }

    var body = digits.slice(0, 10);
    var provided = parseInt(digits.charAt(10), 10);
    var expected = computeCheckDigit(body);

    if (provided !== expected) {
      return {
        valid: false,
        normalized: formatDisplay(digits),
        message: "Dígito verificador incorrecto (módulo 10).",
        details: { esperado: expected, recibido: provided },
      };
    }

    return {
      valid: true,
      normalized: formatDisplay(digits),
      message: "La cédula cumple el algoritmo módulo 10.",
      details: {
        provincial: digits.slice(0, 3),
        secuencia: digits.slice(3, 10),
        verificador: provided,
      },
    };
  }

  function formatDisplay(d11) {
    return d11.slice(0, 3) + "-" + d11.slice(3, 10) + "-" + d11.slice(10);
  }

  function toJsonPayload(result) {
    return {
      servicio: "ValidacionCedulaRD",
      version: "1.0",
      algoritmo: "modulo10",
      timestamp: new Date().toISOString(),
      valido: result.valid,
      cedulaNormalizada: result.normalized,
      mensaje: result.message,
      detalle: result.details || null,
    };
  }

  function toXmlPayload(result) {
    var p = toJsonPayload(result);
    var esc = function (t) {
      return String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };
    var det = p.detalle;
    var detXml = "";
    if (det) {
      detXml =
        "<detalle>" +
        Object.keys(det)
          .map(function (k) {
            return "<" + k + ">" + esc(det[k]) + "</" + k + ">";
          })
          .join("") +
        "</detalle>";
    } else {
      detXml = "<detalle/>";
    }
    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      "<respuesta>\n" +
      "  <servicio>" +
      esc(p.servicio) +
      "</servicio>\n" +
      "  <version>" +
      esc(p.version) +
      "</version>\n" +
      "  <algoritmo>" +
      esc(p.algoritmo) +
      "</algoritmo>\n" +
      "  <timestamp>" +
      esc(p.timestamp) +
      "</timestamp>\n" +
      "  <valido>" +
      p.valido +
      "</valido>\n" +
      "  <cedulaNormalizada>" +
      esc(p.cedulaNormalizada || "") +
      "</cedulaNormalizada>\n" +
      "  <mensaje>" +
      esc(p.mensaje) +
      "</mensaje>\n" +
      "  " +
      detXml +
      "\n" +
      "</respuesta>"
    );
  }

  var api = {
    validate: validateCedula,
    toJsonPayload: toJsonPayload,
    toXmlPayload: toXmlPayload,
    onlyDigits: onlyDigits,
  };
  global.CedulaRD = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
