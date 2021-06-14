require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // PATH ACCESS
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const filter = require('content-filter');
const rateLimit = require("express-rate-limit");



// CONNECT TO DATABASE

mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.oesxt.mongodb.net/dataBaseProjet6?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();



const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// HEADERS TO AVOID CORS RESTRICTIONS

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();   
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

const IN_PROD = process.env.NODE_ENV === 'production';

app.use(session({
  name : process.env.NAME_SESSION,
  secret: process.env.PASSWORD_SESSION,
  resave: true,
  saveUninitialized: true,
  cookie: { 
    maxAge : 1000 * 60 * 60 * 2,
    sameSite: true,
    secure: IN_PROD
  }
})
);

// SET EXPRESS-RATE-LIMIT (5 ATTEMPTS ALL 15 MINUTES)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30
});

app.use(limiter);

// BODY PARSER -> TRANSFORM BODY-REQUEST TO JSON

app.use(bodyParser.json());

// SETTINGS CONTENT-FILTER

const blackList = ['$','{','&&','||'];
const options = {
	urlBlackList: blackList,
	bodyBlackList: blackList
};

app.use(filter(options));

// CALL HELMET

app.use(helmet());


app.use('/images', express.static(path.join(__dirname, 'images'))); // MANAGE REQUEST TO /IMAGES
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);


// EXPORT EXPRESS
module.exports = app;