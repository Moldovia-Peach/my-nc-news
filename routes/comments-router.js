const express = require("express");
const commentsRouter = express.Router();
const { deleteCommentById } = require("../controller/nc-news.controller");

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
