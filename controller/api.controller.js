const endpointsJson = require("../endpoints.json");
const { fetchTopics } = require("../model/api.model");

function getApi(req, res) {
  res.status(200).send({ endpoints: endpointsJson });
}

function getTopics(req, res, next) {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getApi, getTopics };
