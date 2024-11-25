const db = require("../db/connection");

function fetchTopics() {
  return db.query(`SELECT slug, description FROM topics;`).then(({ rows }) => {
    return rows;
  });
}

function fetchArticleById(article_id) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      throw err;
    });
}

module.exports = { fetchTopics, fetchArticleById };
