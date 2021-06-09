const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg',
    'image/png': '.png'    
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {  
        callback(null, 'images')                // CONFIG DESTINATION FILE
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0]; //RECUP ORIGINAL FILENAME
        const extension = MIME_TYPES[file.mimetype]; // ADD EXTENSION
        callback(null, name + Date.now() +  extension ); // RETURN NEW FILENAME 
    }
});

module.exports = multer({ storage }).single('image'); // ONLY IMAGE FILE