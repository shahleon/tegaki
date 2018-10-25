let sinon = require('sinon');
let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();
let imageService = require('../../src/modules/image/services/imageService');
let redis = require('../../src/lib/redis');
let kue = require('../../src/lib/kue');

describe('imageService', function() {
  describe('getImageData', function(){
    let redisValueJson = {
      processed: true,
      name: "6915bf95-dc5f-4aa0-a7f7-c9a1d05b481f.png"
    };

    afterEach(function() {
        redis.get.restore();
    });

    it('should reject with not found error when imageId is not valid', function(){
      sinon.stub(redis, 'get').callsFake(function(key) {
        return Promise.resolve(null);
      });
      return imageService.getImageData(null).should.be.rejected
      .then(function(error) {
          error.should.be.an.instanceOf(Error);
          error.should.have.property('statusCode', 404);
      });
    });

    it('should reject with internal server error when redis get rejects', function(){
      let imageId = '68960128-9a1e-479c-8372-975687bec2a3';
      sinon.stub(redis, 'get').callsFake(function(key) {
        return Promise.reject('redis get error!');
      });
      return imageService.getImageData(null).should.be.rejected
      .then(function(error) {
          error.should.be.an.instanceOf(Error);
          error.should.have.property('statusCode', 500);
      });
    });

    it('should resolve with json response data and status "finished"', function(){
      let imageId = '68960128-9a1e-479c-8372-975687bec2a3';
      sinon.stub(redis, 'get').callsFake(function(key){
        return Promise.resolve(JSON.stringify(redisValueJson));
      });
      return imageService.getImageData(imageId).should.be.fulfilled
      .then(function(data) {
          data.should.have.property('data');
          data.data.should.have.property('id', imageId);
          data.data.should.have.property('status', 'finished');
          data.data.image.should.have.property('original', `/uploads/${redisValueJson.name}`);
          data.data.image.should.have.property('thumb', `/thumbs/${redisValueJson.name}`);
      });
    });

    it('should resolve with json response data and status "pending"', function(){
      let imageId = '68960128-9a1e-479c-8372-975687bec2a3';
      sinon.stub(redis, 'get').callsFake(function(key){
        redisValueJson.processed = false;
        return Promise.resolve(JSON.stringify(redisValueJson));
      });
      return imageService.getImageData(imageId).should.be.fulfilled
      .then(function(data) {
          data.should.have.property('data');
          data.data.should.have.property('id', imageId);
          data.data.should.have.property('status', 'pending');
          data.data.image.should.have.property('original', `/uploads/${redisValueJson.name}`);
          data.data.image.should.have.property('thumb', null);
      });
    });
  });

  describe('saveImageForProcessing', function(){
    let file = {
      filename: "testfile.png"
    };

    afterEach(function() {
        redis.set.restore();
        kue.createJob.restore();
    });

    it('should reject with bad request error when file is missing', function(){
      sinon.stub(redis, 'set').callsFake(function(key, value) {
        return Promise.resove(key);
      });
      sinon.stub(kue, 'createJob').callsFake(function(jobType, jobData) {
        return Promise.resove(true);
      });
      return imageService.saveImageForProcessing(null).should.be.rejected
      .then(function(error) {
          error.should.be.an.instanceOf(Error);
          error.should.have.property('statusCode', 400);
      });
    });

    it('should reject with internal server error when redis set promise rejects', function(){
      sinon.stub(redis, 'set').callsFake(function(key, value) {
        return Promise.reject('redis set error!');
      });
      sinon.stub(kue, 'createJob').callsFake(function(jobType, jobData) {
        return Promise.resove(true);
      });
      return imageService.saveImageForProcessing(file).should.be.rejected
      .then(function(error) {
          error.should.be.an.instanceOf(Error);
          error.should.have.property('statusCode', 500);
      });
    });

    it('should reject with internal server error when kue createJob promise rejects', function(){
      sinon.stub(redis, 'set').callsFake(function(key, value) {
        return Promise.resolve(true);
      });
      sinon.stub(redis, 'delete').callsFake(function(key) {});
      sinon.stub(kue, 'createJob').callsFake(function(jobType, jobData) {
        return Promise.reject('kue createJob error!');
      });
      return imageService.saveImageForProcessing(file).should.be.rejected
      .then(function(error) {
          error.should.be.an.instanceOf(Error);
          error.should.have.property('statusCode', 500);
      });
    });

    it('should resolve with json response data', function(){
      sinon.stub(redis, 'set').callsFake(function(key, value) {
        return Promise.resolve(key);
      });
      sinon.stub(kue, 'createJob').callsFake(function(jobType, jobData) {
        return Promise.resolve(true);
      });
      return imageService.saveImageForProcessing(file).should.be.fulfilled
      .then(function(data) {
          data.should.have.property('data');
          data.data.should.have.property('id');
          data.data.should.have.property('image');
          data.data.image.should.have.property('original', `/uploads/${file.filename}`);
      });
    });
  });

});
