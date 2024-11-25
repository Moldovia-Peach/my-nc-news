const express = require("express");
const { getApi, getTopics } = require("./controller/api.controller");

const app = express();
app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.use((req, res) => {
  res.status(404).send({ msg: "route not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "server error" });
  }
});

module.exports = app;
