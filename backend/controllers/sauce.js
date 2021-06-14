const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    console.log(req.session);
    const sauceObject = JSON.parse(req.body.sauce); // USABLE JAVASCRIPT OBJECT
    // DELETE ID FROM FRONTEND
    delete sauceObject._id;

    // REGEX FOR NAME

    const regex_name = /^[a-zA-Z]{3,15}$/;

    if(!regex_name.test(sauceObject.name)){
        return res.status(420).json({'error' : 'Nom de sauce non valide'});
    }

    // REGEX FOR MANUFACTURER

    const regex_manufacturer = /^['0-9a-zA-Z]{3,25}$/;

    if(!regex_manufacturer.test(sauceObject.manufacturer)){
        return res.status(420).json({'error' : 'Nom de marque non valide'});
    }

    // REGEX FOR MAIN PEPPER

    const regex_mainPepper = /^[a-zA-Z]{3,15}$/;

    if(!regex_mainPepper.test(sauceObject.mainPepper)){
        return res.status(420).json({'error' : 'Nom d\'ingrédient non valide'});
    }

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // COMPLETE URL FILE 
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    //SAVE INTO DATABASE
    sauce.save()
    .then(() => res.status(201).json({message: 'Nouvelle sauce enregistrée !'}))
    .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),              // IF REQ.FILE EXIST, MANAGE THE NEW IMAGE 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body}; // ELSE MANAGE JUST THE BODY REQUEST 
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
    .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1]; //DELETE THE IMAGE INTO /IMAGE
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id}) // DELETE SAUCE INTO DATABASE
            .then(() => res.status(200).json({message: 'Sauce supprimée'}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
    
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};
 
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

exports.likeDislikeSauce = (req, res, next) => {
    //console.log(req.body);
    const likeOrDislike = req.body.like;

    switch(likeOrDislike){
        case 1 : // CASE USER CLICK ON LIKE
            Sauce.updateOne({_id: req.params.id}, {
                $push: {
                    usersLiked: req.body.userId
                },
                $inc: {
                    likes: +1
                },
            })
            .then(() => res.status(200).json({message: 'Like ajouté !'}))
            .catch(error => res.status(400).json({error}));
            break;

        case -1: // CASE USER CLICK ON DISLIKE
            Sauce.updateOne({_id: req.params.id}, {
                $push: {
                    usersDisLiked: req.body.userId
                },
                $inc: {
                    dislikes: +1
                },
            })
            .then(() => res.status(200).json({message: 'Dislike ajouté !'}))
            .catch(error => res.status(400).json({error}));
            break;

        case 0: // CASE USER CLICK SECOND TIME LIKE OR DISLIKE
            Sauce.findOne({_id: req.params.id})
            .then(sauce =>  {
                
                const userId = req.body.userId;
                const userLiked = sauce.usersLiked.indexOf(userId);
        
                if(userLiked !== -1){
                    Sauce.updateOne({_id: req.params.id}, {
                        $pull: {
                            usersLiked: req.body.userId
                        },
                        $inc: {
                            likes: -1
                        }
                    })
                    .then(() => res.status(200).json({message : 'Like annulé ! '}))
                    .catch(error => res.status(400).json({error}));
                }else{
                    Sauce.updateOne({_id: req.params.id}, {
                        $pull: {
                            usersDisliked: req.body.userId
                        },
                        $inc: {
                            dislikes: -1
                        }
                    })
                    .then(() => res.status(200).json({message : 'Dislike annulé ! '}))
                    .catch(error => res.status(400).json({error}));
                }
            })
            .catch(error => res.status(400).json({error}));
        }
}