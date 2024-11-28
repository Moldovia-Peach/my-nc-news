exports.handleCustomErrors = (err, req, res, next) => {
  const defaultErrorMessages = {
    400: "Bad Request",
    404: "Resource Not Found",
  };
  if (defaultErrorMessages[err.status]) {
    return res
      .status(err.status)
      .send({ msg: err.msg || defaultErrorMessages[err.status] });
  }
  next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  const commonPsqlErrors = {
    "22P02": { status: 400, msg: "Bad Request" },
    23502: { status: 400, msg: "Not Null Violation" },
    23503: { status: 404, msg: "Foreign Key Violation" },
    23505: { status: 409, msg: "Unique Constraint Violation" },
  };
  const psqlError = commonPsqlErrors[err.code];
  if (psqlError) {
    return res.status(psqlError.status).send({ msg: psqlError.msg });
  }
  next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};

exports.handleUnmatchedEndpoints = (req, res, next) => {
  res.status(404).send({ msg: "Resource Not Found" });
};
