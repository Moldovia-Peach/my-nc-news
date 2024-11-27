const express = require("express");
const {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  updateArticle,
} = require("./controller/nc-news.controller");
const {
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errorHandling");

const app = express();
app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", updateArticle);

app.use((req, res, next) => {
  const err = { status: 404, msg: "404 Not Found" };
  next(err);
});

app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
