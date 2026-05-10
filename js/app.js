(function () {
  "use strict";

  var input = document.getElementById("cedula");
  var form = document.getElementById("form-cedula");
  var statusEl = document.getElementById("status");
  var jsonOut = document.getElementById("out-json");
  var xmlOut = document.getElementById("out-xml");
  var copyJson = document.getElementById("copy-json");
  var copyXml = document.getElementById("copy-xml");

  function setStatus(ok, text) {
    statusEl.className = "status " + (ok ? "status--ok" : "status--err");
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  function runValidation() {
    var raw = input.value;
    var result = CedulaRD.validate(raw);
    var json = CedulaRD.toJsonPayload(result);
    var xml = CedulaRD.toXmlPayload(result);

    jsonOut.textContent = JSON.stringify(json, null, 2);
    xmlOut.textContent = xml;
    setStatus(result.valid, result.message);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    runValidation();
  });

  input.addEventListener("input", function () {
    var d = CedulaRD.onlyDigits(input.value).slice(0, 11);
    if (d.length > 3 && d.length <= 10) {
      input.value = d.slice(0, 3) + "-" + d.slice(3);
    } else if (d.length === 11) {
      input.value = d.slice(0, 3) + "-" + d.slice(3, 10) + "-" + d.slice(10);
    } else if (d.length > 10) {
      input.value = d.slice(0, 3) + "-" + d.slice(3, 10) + "-" + d.slice(10);
    } else if (d.length > 3) {
      input.value = d.slice(0, 3) + "-" + d.slice(3);
    } else {
      input.value = d;
    }
  });

  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      var prev = btn.textContent;
      btn.textContent = "Copiado";
      setTimeout(function () {
        btn.textContent = prev;
      }, 1200);
    });
  }

  copyJson.addEventListener("click", function () {
    copyText(jsonOut.textContent, copyJson);
  });
  copyXml.addEventListener("click", function () {
    copyText(xmlOut.textContent, copyXml);
  });

  runValidation();
})();
