const service = require('../services/imageService');

// GET /image/:id/thumbnail route handler
let getImage = function(req, res, next){
  service.getImageData(req.params.id)
    .then(function(data){
      res.status(200).json(data);
    })
    .catch(function(err){
      next(err);
    });
}

// POST /image route handler
let postImage = function (req, res, next) {
  service.saveImageForProcessing(req.file)
    .then(function(data){
      res.status(201).json(data);
    })
    .catch(function(err){
      next(err);
    });
}

module.exports = {
  getImage : getImage,
  postImage : postImage
}
