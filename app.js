const express = require("express");
const {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticeId,
} = require("./controller/nc-news.controller");
const {
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errorHandling");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticeId);

app.use((req, res, next) => {
  const err = { status: 404, msg: "404 Not Found" };
  next(err);
});

app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
