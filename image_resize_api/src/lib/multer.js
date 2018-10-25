const uuidv4 = require('uuid/v4');
const multer = require('multer');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '.png')
  }
});

let upload = multer({
    storage: storage,
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    },
});

module.exports = {
  upload : upload
}
