const service = require('../services/imageService');

let getImage = function(req, res, next){
  service.getImageData(req.params.id)
    .then(function(data){
      res.status(200).json(data);
    })
    .catch(function(err){
      next(err);
    });
}

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
