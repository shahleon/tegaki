require('dotenv').config({silent: true});
const gm = require('./lib/gm');
const kue = require('kue');
const redis = require('./lib/redis');

let jobType = 'image';

const queue = kue.createQueue({
  redis: process.env.REDIS_CONNSTR
});

queue.on( 'error', function( err ) {
  console.log( 'Something went wrong with kue ', err );
});

queue.process(jobType, function(job, done){
  resizeImage(job, done);
});

// resize image with the image name and size data from kue job and update redis with proper status
function resizeImage(job, done) {
  redis.get(job.data.redisKey)
    .then(function(data){
      if (!data) {
        console.log('No image found');
        done();
      } else {
        let imageData = JSON.parse(data);
        let width = job.data.size.width;
        let height = job.data.size.height;
        let srcPath = '/uploads/' + imageData.name;
        let destPath = '/thumbs/' + imageData.name;
        gm.resize(srcPath, destPath, width, height)
          .then(function(data) {
            redis.set(job.data.redisKey, JSON.stringify({"processed" : true, "name" : imageData.name}))
              .then(function(key){
                done();
              })
              .catch(function(err){
                done(new Error(err));
              })
          })
          .catch(function(err){
            console.log('Could not resize image', err);
            done(new Error('Could not resize image'));
          })
      }
    })
    .catch(function(err){
      console.log('Could not get data from redis', err);
      done(new Error('Redis error!'));
    })
}

module.exports = {
  resizeImage : resizeImage
}
