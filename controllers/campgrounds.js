const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = (process.env.MAPBOX_TOKEN);
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}


module.exports.renderNew = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.newPost =  async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
   const campground = new Campground(req.body.campground);
   campground.geometry = geoData.body.features[0].geometry;
   campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
   campground.author = req.user._id;
   await campground.save();
   req.flash('success', 'Successfully made a new campground!');
   res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.renderShow = async (req, res,) => {             /*get the campG, get the review array from the CG. then, get the user for each review */
const campground = await Campground.findById(req.params.id).populate
({path: 'reviews',
    populate: {
        path: 'author'
    }
}) .populate('author'); /* finally, populate the author of the campground record */
if (!campground) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/campgrounds');
}
res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    campground.author = req.user._id
    res.render('campgrounds/edit', { campground });
}

module.exports.editPut = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    await campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages){
         await   cloudinary.uploader.destroy(filename);
        }
    await campground.updateOne({$pull : {images: { filename: {$in:req.body.deleteImages}}}})
        /* PULL from IMAGES array where the FILENAME is in the deleteImages array */
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.campDelete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}