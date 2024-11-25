const endpointsJson = require("../endpoints.json");
const { fetchTopics, fetchArticleById } = require("../model/nc-news.model");

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

module.exports = { getApi, getTopics, getArticleById };
