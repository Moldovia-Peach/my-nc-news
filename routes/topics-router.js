const express = require("express");
const topicsRouter = express.Router();
const { getTopics } = require("../controller/nc-news.controller");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
