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

function fetchAllArticles(sort_by = "created_at", order = "desc", topic) {
  const allowedSortByColumns = [
    "created_at",
    "title",
    "votes",
    "author",
    "topic",
    "article_id",
    "comment_count",
  ];
  const allowedOrder = ["asc", "desc"];

  if (!allowedSortByColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort by column" });
  }
  if (!allowedOrder.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid order" });
  }

  let queryStr = `
    SELECT 
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
  `;
  const queryValues = [];

  if (topic) {
    queryStr += " WHERE articles.topic = $1";
    queryValues.push(topic);
  }

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order.toUpperCase()}
  `;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    if (topic && rows.length === 0) {
      return db
        .query("SELECT * FROM topics WHERE slug = $1", [topic])
        .then(({ rows: topicRows }) => {
          if (topicRows.length === 0) {
            return [];
          }
          return [];
        });
    }
    return rows;
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

function removeCommentById(comment_id) {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `Comment with id ${comment_id} not found`,
        });
      }
    });
}

function fetchAllUsers() {
  return db
    .query(`SELECT username, name, avatar_url FROM users;`)
    .then(({ rows }) => {
      return rows;
    });
}

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  addComment,
  updateArticleVotes,
  removeCommentById,
  fetchAllUsers,
};
