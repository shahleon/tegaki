# Tegaki Service

## About

This service accepts image and returns resized thumbnail through RESTful APIs. It consists of two separate applications:

- `image_resize_api` : the RESTful API server, responsible for accepting new image and returning resized thumbnail
- `image_resize_worker` : the worker app, responsible for getting new job from `Kue` work queue and resize using imagemagick

The image_resize_api RESTful API server uses the following:

- [Docker](https://www.docker.com/) as the container service.
- [Node.js](https://nodejs.org/en/) as the run-time environment to run JavaScript.
- [Express.js](https://expressjs.com/) as the server framework.
- [Redis](https://redis.io/) as the datastore for image as well as work queue.
- [Kue](https://github.com/Automattic/kue) as the work queue.
- [Mocha](https://mochajs.org/) as the test framework.
- [Chai](https://www.chaijs.com/) as the assertion library.
- [Sinon](https://sinonjs.org/) as the stubbing library for test targets dependency stubbing.
- [chai-as-promised](https://github.com/domenic/chai-as-promised) for asserting promise.
- [Multer](https://github.com/expressjs/multer) for uploading image.

The image_resize_worker worker uses the following:

- [Docker](https://www.docker.com/) as the container service.
- [Node.js](https://nodejs.org/en/) as the run-time environment to run JavaScript.
- [Redis](https://redis.io/) as the datastore for image as well as work queue.
- [Kue](https://github.com/Automattic/kue) as the work queue.
- [gm](https://github.com/aheckmann/gm) as nodejs wrapper library for imagemagick
- [Mocha](https://mochajs.org/) as the test framework.
- [Chai](https://www.chaijs.com/) as the assertion library.
- [Sinon](https://sinonjs.org/) as the stubbing library for test targets dependency stubbing.
- [Proxyquire](https://github.com/thlorenz/proxyquire) to proxy nodejs's require (Kue)

## How to Install & Run

First download and install [Docker Desktop](https://www.docker.com/products/docker-desktop) or [Linux equivalent](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

1.  Run `docker-compose up` to start three containers:
    - the Node.js API server app container
    - the redis datastore container
    - the worker app container
2.  Server is accessible at `http://localhost:3000` from host machine.

## How to Run Tests

Tests are run outside of docker container. You should be able to run `npm install` followed by `npm test` to run everything (assuming you Node installed on your machine), commands must be run from inside root directory of respective apps

## Image file storage

Uploaded images are stored in `/uploads` directory, Resized images are stored in `/thumbs` directory
