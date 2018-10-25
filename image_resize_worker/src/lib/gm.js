const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');

let resize = function(srcPath, destPath, maxWidth, maxHeight) {
  return new Promise(function(resolve, reject){
    gm(srcPath)
      .resize(maxWidth, maxHeight, '!')
      .write(destPath, function (err) {
        if (err) {
          console.log('Error occured while resizing image', err);
          return reject(err);
        } else {
          console.log('Successfully resized image');
          return resolve(true);
        }
      });
  })
}

module.exports = {
  resize : resize
}
