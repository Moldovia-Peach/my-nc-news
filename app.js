const express = require("express");
const getApi = require("./controller/api.controller");

const app = express();

app.get("/api", getApi);

module.exports = app;
