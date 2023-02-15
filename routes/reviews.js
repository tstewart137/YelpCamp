
const express = require('express');
const router = express.Router({ mergeParams: true });
const {validateReview, isLoggedIn, isReviewer} = require('../middleware')
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.newReview))

router.delete('/:reviewId', isLoggedIn, isReviewer, catchAsync(reviews.revDelete));

module.exports = router;