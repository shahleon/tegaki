const kue = require('kue');

const queue = kue.createQueue({
  redis: process.env.REDIS_CONNSTR
});

queue.on( 'error', function( err ) {
  console.log( 'Something went wrong with kue ', err );
});

let createJob = function(type, data) {
  return new Promise(function(resolve, reject){
    queue.create(type, data)
      .removeOnComplete(true)
      .attempts(3)
      .backoff({delay: 60*1000, type:'exponential'})
      .save(function(error) {
        if (error) {
          console.error('Could not save job', error);
          return reject(error);
        } else {
          console.log(`Successfully saved job in ${type} queue`);
          return resolve(true);
        }
      })
  })
}

module.exports = {
  createJob : createJob
}
