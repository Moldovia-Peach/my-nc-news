const express = require("express");
const usersRouter = express.Router();
const { getAllUsers } = require("../controller/nc-news.controller");

usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
