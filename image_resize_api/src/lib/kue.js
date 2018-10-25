const kue = require('kue');
let failureAttempts = 3;
let reattemptDelay = 60*1000;

const queue = kue.createQueue({
  redis: process.env.REDIS_CONNSTR
});

queue.on( 'error', function( err ) {
  console.log( 'Something went wrong with kue ', err );
});

// create a `type` of job in kue for worker
let createJob = function(type, data) {
  return new Promise(function(resolve, reject){
    queue.create(type, data)
      .removeOnComplete(true)
      .attempts(failureAttempts)
      .backoff({delay: reattemptDelay, type:'fixed'})
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
