var redis = require('redis');
var client = redis.createClient(process.env.REDIS_CONNSTR);

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong with redis', err);
});

// set value for the provided key in redis and returns a Promise
let set = function(key, value) {
  return new Promise(function(resolve, reject) {
    client.set(key, value, function(err, data) {
      if(err) {
        console.log(`Could not set data to redis with key: ${key}`, err);
        return reject(err);
      } else {
        console.log(`Successfully set data to redis with key: ${key}`);
        return resolve(key);
      }
    });
  });
}

// get value for the provided key in redis and returns a Promise
let get = function (key) {
  return new Promise(function (resolve, reject) {
    client.get(key, function(err, data) {
      if(err) {
        console.log(`Could not get data from redis with key: ${key}`, err);
        return reject(err);
      } else {
        console.log(`Fetched data for ${key}: ${data}`);
        return resolve(data);
      }
    });
  });
}

// delete the provided key from redis and returns a Promise
let deleteKey = function (key) {
  client.del(key, function(err, response) {
    if(err) {
      console.log(`Could not delete data with key: ${key}`, err);
    } else {
      console.log(`Successfully deleted data from redis with key: ${key}`);
    }
  });
}

module.exports = {
  set : set,
  get : get,
  delete : deleteKey
}
