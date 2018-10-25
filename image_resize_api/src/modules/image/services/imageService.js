const redis = require('../../../lib/redis');
const kue = require('../../../lib/kue');
const errors = require('../../../errors');
const uuidv4 = require('uuid/v4');

// get uploaded image data from redis
// and returns a Promise
let getImageData = function(imageId) {
  let response = {
    data: {
      id: imageId,
      status: null,
      image: {
        original: null,
        thumb: null
      }
    }
  };

  return new Promise(function(resolve, reject){
    redis.get(imageId)
      .then(function(data){
        if (!data) {
          return reject(errors.NotFoundError());
        } else {
          data = JSON.parse(data);
          response.data.status = data.processed ? "finished" : "pending";
          response.data.image.original = "/uploads/" + data.name;
          response.data.image.thumb = data.processed ? "/thumbs/" + data.name : null;
          return resolve(response);
        }
      })
      .catch(function(err){
        console.log(err);
        return reject(errors.InternalServerError());
      });
  });
}

// store uploaded image data in redis and create a kue job for processing by worker
// and returns a Promise
let saveImageForProcessing = function(file) {
  return new Promise(function(resolve, reject){
    if (!file) {
      console.log("No file received");
      return reject(errors.BadRequestError("No file received"));
    } else {
      let key = uuidv4();
      let value = JSON.stringify({
        processed: false,
        name: file.filename
      });
      let jobType = 'image';
      let jobData = {
        redisKey: key,
        size: {
          width: 100,
          height: 100
        }
      };
      let response = {
        data: {
          id: key,
          image: {
            original: `/uploads/${file.filename}`
          }
        }
      }

      redis.set(key, value)
        .then(function(key) {
          kue.createJob(jobType, jobData)
            .then(function(result){
              return resolve(response);
            })
            .catch(function(err){
              console.log(err);
              redis.delete(key);
              return reject(errors.InternalServerError());
            });
        })
        .catch(function(err) {
          console.log(err);
          return reject(errors.InternalServerError());
        })
    }
  })
}

module.exports = {
  getImageData : getImageData,
  saveImageForProcessing : saveImageForProcessing
}
