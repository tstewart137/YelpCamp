const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp', { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => {
        console.log(" CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO - not today!!!!")
        console.log(err)
    })



const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'This place is nice',
            price: 100,
            geometry: {
                 type: "Point", 
                 coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
            ]},
            author:'63e279a499f542ce71358a92',
            images:[
                {
                url: 'https://res.cloudinary.com/dp799xu4q/image/upload/v1676306212/YelpCamp/ifkcgi24wsgdtzoca7wn.jpg',
                filename: 'ifkcgi24wsgdtzoca7wn'
                },
                {
                url: 'https://res.cloudinary.com/dp799xu4q/image/upload/v1676306091/YelpCamp/oguljqc99q423htb6gzx.jpg',
                filename: 'oguljqc99q423htb6gzx'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();

    console.log("done!")
})

