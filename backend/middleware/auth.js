const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try{
      const token = req.headers.authorization.split(' ')[1]; // RECUP TOKEK AFTER BEARER 
      const decodedToken = jwt.verify(token, process.env.TOKEN); // VERIFY THIS TOKEN WITH TOKEN KEY 
      const userId = decodedToken.userId; // RECUP USERID IN THE TOKEN 
      if(req.body.userId && req.body.userId !== userId){ 
          throw 'User Id non valable !';
      } else {
          next(); // GO TO THE NEXT MIDDLEWARE
      }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée !'});
    }
};