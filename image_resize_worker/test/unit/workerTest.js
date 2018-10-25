let proxyquire =  require('proxyquire');
let sinon = require('sinon');
let chai = require('chai');
let should = chai.should();
let redis = require('../../src/lib/redis');
let gm = require('../../src/lib/gm');

let kueStub = {};
kueStub.createQueue = function (config) {
  return {
    on: function(event, callback){},
    process: function(event, callback){}
  };
};
let worker = proxyquire('../../src/worker', { 'kue': kueStub });

describe('worker', function() {
  it('should not send any err if no data is found in redis', function(done){
    sinon.stub(redis, 'get').callsFake(function(key) {
      return Promise.resolve(null);
    });
    worker.resizeImage({data:{redisKey:''}}, function(err) {
      should.equal(err, undefined);
      done();
    });
  });

  it('should send an err if fails to get data from redis', function(done){
    redis.get.restore();
    sinon.stub(redis, 'get').callsFake(function(key) {
      return Promise.reject(null);
    });
    worker.resizeImage({data:{redisKey:''}}, function(err) {
      err.should.be.an.instanceOf(Error);
      err.message.should.be.equal('Redis error!');
      done();
    });
  });

  it('should send err when gm resize method fails', function(done){
    let redisValueJson = { "processed" : false, "name" : "image-name.png" };
    redis.get.restore();
    sinon.stub(redis, 'get').callsFake(function(key) {
      return Promise.resolve(JSON.stringify(redisValueJson));
    });
    sinon.stub(gm, 'resize').callsFake(function(src, dest, width, height) {
      return Promise.reject('gm resize error!')
    });

    worker.resizeImage({data:{redisKey:'image-id'}}, function(err) {
      err.should.be.an.instanceOf(Error);
      err.message.should.be.equal('Could not resize image');
      done();
    });
  });

  it('should not send err when gm resize is done', function(done){
    let redisValueJson = { "processed" : false, "name" : "image-name.png" };
    redis.get.restore();
    sinon.stub(redis, 'get').callsFake(function(key) {
      return Promise.resolve(JSON.stringify(redisValueJson));
    });
    gm.resize.restore();
    sinon.stub(gm, 'resize').callsFake(function(src, dest, width, height) {
      return Promise.resolve(true)
    });
    sinon.stub(redis, 'set').callsFake(function(key, value) {
      return Promise.resolve(key);
    });

    worker.resizeImage({data:{redisKey:'image-id'}}, function(err) {
      should.equal(err, undefined);
      done();
    });
  });

})
