const multer = require("multer");
// Store files in memory as Buffer
const storage = multer.memoryStorage();

//gain acces th the stored files 
const uploads = multer({ storage });

//export the middleware to allow stored files accessable for pushing to database
module.exports = uploads;
