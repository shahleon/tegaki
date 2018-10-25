require('dotenv').config({silent: true});
const express = require('express');
const bodyParser = require('body-parser');
const imageRoutes = require('./modules/image/routes/images');

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json({type: 'application/json'}));

app.use('/image', imageRoutes);
app.use('*', invalidRouteHandler);
app.use(errorHandler);

// global error handler
function errorHandler(err, req, res, next) {
  console.log(err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  res.status(err.statusCode).json({
    error : {
      code : err.statusCode,
      message : err.message
    }
  });
}

// invalid route handler
function invalidRouteHandler(req, res, next) {
  res.status(404).json({
    error : {
      code : 404,
      message : "Route not found"
    }
  })
}

app.listen(port, function() {
  console.log(`Running on port ${port}`);
});
