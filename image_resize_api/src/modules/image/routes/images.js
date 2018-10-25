const express = require('express');
const router = express.Router();
const multer = require('../../../lib/multer');
const imageController = require('../controllers/imageController');

router.get('/:id/thumbnail', imageController.getImage);
router.post('/', multer.upload.single('image'), imageController.postImage);

module.exports = router
