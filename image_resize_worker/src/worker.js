require('dotenv').config({silent: true});
const gm = require('./lib/gm');
const kue = require('kue');
const redis = require('./lib/redis');

const queue = kue.createQueue({
  redis: process.env.REDIS_CONNSTR
});

queue.on( 'error', function( err ) {
  console.log( 'Something went wrong with kue ', err );
});

queue.process('image', function(job, done){
  resizeImage(job, done);
});

function resizeImage(job, done) {
  redis.get(job.data.redisKey)
    .then(function(data){
      if (!data) {
        console.log('No image found');
        done();
      } else {
        let imageData = JSON.parse(data);
        let srcPath = '/uploads/' + imageData.name;
        let destPath = '/thumbs/' + imageData.name;
        gm.resize(srcPath, destPath, 100, 100)
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
