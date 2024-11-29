const express = require("express");
const articlesRouter = express.Router();
const {
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
} = require("../controller/nc-news.controller");

articlesRouter.get("/", getAllArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticle);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postComment);

module.exports = articlesRouter;
