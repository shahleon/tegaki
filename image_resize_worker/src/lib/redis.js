var redis = require('redis');
var client = redis.createClient(process.env.REDIS_CONNSTR);

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong with redis', err);
});

let set = function (key, value) {
  return new Promise(function (resolve,reject) {
    client.set(key, value, function(err,data) {
      if(err) {
        console.log(`Could not set data to redis with key: ${key}`, err);
        return reject(err);
      } else {
        console.log(`Successfully set data to redis with key: ${key}`);
        return resolve(key);
      }
    })
  })
}

let get = function (key) {
  return new Promise(function (resolve,reject) {
    client.get(key, function(err,data) {
      if(err) {
        console.log(`Could not get data from redis with key: ${key}`, err);
        return reject(err);
      } else {
        console.log(`Successfully fetched data from redis with key: ${key}`);
        return resolve(data);
      }
    })
  })
}

module.exports = {
  set : set,
  get : get
}
