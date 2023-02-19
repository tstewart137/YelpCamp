const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');     /* controllers */
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});
const Campgrounds  = require('../models/campground')


router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn,  upload.array('image'),validateCampground, catchAsync(campgrounds.newPost))



router.get('/new', isLoggedIn,  campgrounds.renderNew)

router.route('/:id')
.get( catchAsync(campgrounds.renderShow))
.put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editPut))

.delete( isLoggedIn, isAuthor, catchAsync(campgrounds.campDelete))


router.get('/:id/edit', isLoggedIn, isAuthor,  catchAsync(campgrounds.renderEditForm));




module.exports = router;
