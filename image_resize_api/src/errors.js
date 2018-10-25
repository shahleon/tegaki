let InternalServerError = function (message) {
  let err = new Error(message || "Internal Server Error!");
  err.statusCode = 500;
  return err;
}

let NotFoundError = function (message) {
  let err = new Error(message || "Resource Not Found!");
  err.statusCode = 404;
  return err;
}

let BadRequestError = function (message) {
  let err = new Error(message || "Bad Request!");
  err.statusCode = 400;
  return err;
}

module.exports = {
  InternalServerError : InternalServerError,
  NotFoundError : NotFoundError,
  BadRequestError : BadRequestError
}
