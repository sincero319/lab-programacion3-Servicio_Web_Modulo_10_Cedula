"use strict";

var express = require("express");
var path = require("path");
var CedulaRD = require(path.join(__dirname, "js", "validator.js"));

var app = express();
var preferredPort = parseInt(process.env.PORT, 10);
if (isNaN(preferredPort)) preferredPort = 3000;
var ROOT = __dirname;

app.use(express.json());
app.use(express.static(ROOT));

function handleValidate(req, res, wantXml) {
  var raw = req.query.numero || req.body.numero || req.body.cedula || "";
  var result = CedulaRD.validate(raw);
  res.set("X-Servicio", "ValidacionCedulaRD");
  if (wantXml) {
    res.type("application/xml; charset=utf-8");
    res.send(CedulaRD.toXmlPayload(result));
  } else {
    res.json(CedulaRD.toJsonPayload(result));
  }
}

app.get("/api/cedula", function (req, res) {
  handleValidate(req, res, false);
});

app.get("/api/cedula.xml", function (req, res) {
  handleValidate(req, res, true);
});

app.post("/api/cedula", function (req, res) {
  handleValidate(req, res, false);
});

app.post("/api/cedula.xml", function (req, res) {
  handleValidate(req, res, true);
});

function listenFrom(port, maxAttempts) {
  var server = app.listen(port, function () {
    console.log("Servicio en http://localhost:" + port);
    if (port !== preferredPort) {
      console.log("(puerto " + preferredPort + " ocupado; use esta URL o libere ese puerto)");
    }
    console.log("API JSON:  GET/POST /api/cedula");
    console.log("API XML:   GET/POST /api/cedula.xml");
  });
  server.on("error", function (err) {
    if (err.code === "EADDRINUSE" && maxAttempts > 0) {
      listenFrom(port + 1, maxAttempts - 1);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
}

listenFrom(preferredPort, 20);
