const express = require("express");
const apiRouter = require("./routes/api-router");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
  handleUnmatchedEndpoints,
} = require("./errors/errorHandling");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleUnmatchedEndpoints);
app.use(handleServerErrors);

module.exports = app;
