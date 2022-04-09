if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const app = express()
const ejs = require('ejs')
const methodOverride = require('method-override')


const path = require('path')
const ejsMate = require('ejs-mate')

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/wobot'

const port = process.env.PORT || 3000

// Routes
const product = require('./routes/product')
const user = require('./routes/user')
const profile = require('./routes/profile')

const mongoose=require('mongoose')
const Product =require('./model/product')
const User = require('./model/user')

const passport = require('passport')
const localStrategy = require('passport-local')

const session = require('express-session')

const MongoDBStore = require("connect-mongo");


mongoose.connect(dbURL)
.then(()=>{
    console.log('Connected to database')
})
.catch(e=>{
    console.log('Error', e)
})

const secret = process.env.secret || 'secretCode'
const store = new MongoDBStore({
    mongoUrl: dbURL,
    secret,
    collectionName:'session',
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionDetail = {
    store,
    secret,
    saveUninitialized: true,
    resave:false,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionDetail))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.currentUser = req.user
    next()
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

app.use('/product', product)
app.use('/profile', profile)
app.use('/',user)

app.get('/', (req, res)=>{
    res.render('home')
})
app.get('*', (req ,res)=>{
    res.status(404).send('Cannot get the page')
})

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`)
})