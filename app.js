const express = require("express");
const { getApi, getTopics } = require("./controller/api.controller");
const { handleCustomErrors, handleServerErrors } = require("./errors/index");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  const err = { status: 404, msg: "404 Not Found" };
  next(err);
});

app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
