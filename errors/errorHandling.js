exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({ msg: err.msg || "Article Not Found" });
  }

  if (err.status === 400) {
    return res.status(400).send({ msg: err.msg || "Bad Request" });
  }

  next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
