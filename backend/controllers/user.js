
const bcrypt = require('bcrypt'); // encrypt password
const jwt = require('jsonwebtoken');
require('dotenv').config(); // for using env variables
var Buffer = require('buffer/').Buffer; // encrypt mail in database
const User = require('../models/User');

const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const password_regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

exports.signup = (req, res, next) => {
    
    // if email regex return false => error 400

    if(!email_regex.test(req.body.email)){
        return res.status(420).json({'error' : 'email non valide'});
    }

    // if password regex return false => error 400 (password with at least: one digit, one lower case, one upper case, at least 8 characters)

    if(!password_regex.test(req.body.password)){
        return res.status(422).json({'error' : 'mot de passe non valide'});
    }

    // encrypt email
    let buff = new Buffer(req.body.email);
    let base64mail = buff.toString('base64');

    // encrypt password
    bcrypt.hash(req.body.password,10) // 10 = number of turns of the algorithm
    .then(hash => {
        
        const user = new User({  // create new user 
            email: base64mail,
            password: hash,
        });

        user.save() //save in database
        .then(() => res.status(201).json({message: 'Utilisateur crée !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    
    let buff = new Buffer(req.body.email);
    let base64mail = buff.toString('base64');

    User.findOne({email:base64mail})
    
    .then(user => {

        if(!user){
            return res.status(401).json({error: "Uilisateur non trouvé !"})
        }

        // User OK:
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid){
                return res.status(401).json({error: "Mot de passe incorrect !"})
            }
            res.status(200).json({ // LOGIN WITH USERID & TOKEN
                userId: user._id,
                token:  jwt.sign(    // CREATE NEW TOKEN
                    { userId : user._id},
                    process.env.TOKEN,
                    { expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};