const endpointsJson = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
} = require("../model/nc-news.model");

function getApi(req, res) {
  res.status(200).send({ endpoints: endpointsJson });
}

function getTopics(req, res, next) {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
}

function handleError(status, msg, next) {
  next({ status, msg });
}

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  if (isNaN(Number(article_id))) {
    handleError(400, "Invalid article id format", next);
    return;
  }
  fetchArticleById(article_id)
    .then((article) => {
      if (!article) {
        handleError(404, `Article with id ${article_id} not found`, next);
        return;
      }
      res.status(200).send({ article });
    })
    .catch(next);
}

function getAllArticles(req, res, next) {
  const { sort } = req.query;
  if (sort && !["created_at", "title", "votes"].includes(sort)) {
    handleError(400, "Invalid query parameter", next);
    return;
  }
  fetchAllArticles()
    .then((articles) => {
      if (!articles || articles.length === 0) {
        handleError(404, "No articles found", next);
        return;
      }
      res.status(200).send({ articles });
    })
    .catch(next);
}

function getCommentsByArticeId(req, res, next) {
  const { article_id } = req.params;
  if (isNaN(Number(article_id))) {
    handleError(400, "Invalid article id format", next);
    return;
  }
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      if (!comments || comments.length === 0) {
        handleError(404, `No comments found for article ${article_id}`, next);
        return;
      }
      res.status(200).send({ comments });
    })
    .catch(next);
}

module.exports = {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticeId,
};
