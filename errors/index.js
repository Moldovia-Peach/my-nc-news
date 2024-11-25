exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status === 404) {
    return res.status(404).send({ msg: "404 Not Found" });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
