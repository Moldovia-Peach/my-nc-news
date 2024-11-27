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

function fetchAllArticles() {
  return db
    .query(
      `SELECT 
        articles.article_id, 
        articles.title, 
        articles.topic, 
        articles.author, 
        articles.created_at, 
        articles.votes, 
        articles.article_img_url,
        COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments 
      ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

function fetchCommentsByArticleId(article_id) {
  return db
    .query(
      `SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
}

function addComment(article_id, username, body) {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Username and body are required",
    });
  }

  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then((userResult) => {
      if (userResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Username does not exist",
        });
      }

      return db.query("SELECT * FROM articles WHERE article_id = $1", [
        article_id,
      ]);
    })
    .then((articleResult) => {
      if (articleResult.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Article with id ${article_id} not found`,
        });
      }

      return db.query(
        "INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *",
        [article_id, username, body]
      );
    })
    .then((result) => result.rows[0]);
}

function updateArticleVotes(article_id, inc_votes) {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING*`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    });
}

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  addComment,
  updateArticleVotes,
};
