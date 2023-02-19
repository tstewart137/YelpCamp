if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

console.log(`env = ${process.env.NODE_ENV}`)
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
//const helmet = require("helmet");

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const db_url = process.env.db_url ||'mongodb://127.0.0.1:27017/YelpCamp'
const MongoStore = require('connect-mongo')

console.log(`url = ${db_url}`)
//'mongodb://127.0.0.1:27017/YelpCamp'
//mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true }) 
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => {
        console.log("Camping!!!")
    })
    .catch(err => {
        console.log("NOT Camping!!!!")
        console.log(err)
    })


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());
/* app.use(helmet()); */

 const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl:db_url,
    touchAfter : 24*60*60,
    crypto:{
        secret: secret,
    }
});

store.on('error', function(e) {
    console.log('Session store error', e);
});


const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());  /* this must follow app.use(session) not before */
passport.use(new LocalStrategy(User.authenticate())); /* tell passport we are using the LocalStratedgy, and their authenticate function defined in the model */

/* passport local strategy methods */
passport.serializeUser(User.serializeUser()); /* this tells passport how to put the user in the session */
passport.deserializeUser(User.deserializeUser()); /* this tells passport how to remove the user from the session */


app.use((req, res, next) => {
   res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

