const express = require("express");
const {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
  deleteCommentById,
  getAllUsers,
} = require("./controller/nc-news.controller");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
  handleUnmatchedEndpoints,
} = require("./errors/errorHandling");

const app = express();
app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getAllUsers);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleUnmatchedEndpoints);
app.use(handleServerErrors);

module.exports = app;
