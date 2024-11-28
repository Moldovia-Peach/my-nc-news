const endpointsJson = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  addComment,
  patchArticleVotes,
  removeCommentById,
  fetchAllUsers,
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

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
}

function getAllArticles(req, res, next) {
  const { sort_by = "created_at", order = "desc", topic } = req.query;
  fetchAllArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
}

function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
}

function postComment(req, res, next) {
  const { article_id } = req.params;
  const { username, body } = req.body;
  addComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

function patchArticle(req, res, next) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  patchArticleVotes(article_id, inc_votes)
    .then((patchedArticle) => {
      res.status(200).send({ article: patchedArticle });
    })
    .catch(next);
}

function deleteCommentById(req, res, next) {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

function getAllUsers(req, res, next) {
  fetchAllUsers().then((users) => {
    res.status(200).send({ users });
  });
}

module.exports = {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
  deleteCommentById,
  getAllUsers,
};
