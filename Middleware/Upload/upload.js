const multer = require('multer')
const path = require('path')

const filesUpload  = multer({
    //limit the size of file
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req)
    }
}).single("anki")

//checking file type
//if error error is stored in req.uploaderror
function checkFileType(file, cb, req){
    // allowed exte
    const fileTypes = /apkg|application|octet-stream/
    //check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    //check mine type
    const mimeType = fileTypes.test(file.mimetype)

    if(mimeType && extname){
        file.storeName = file.fieldname + path.extname(file.originalname).toLowerCase()
        return cb(null, true)
    } else {
        req.uploaderror = true
        return cb(null, false)
    }
}

module.exports = filesUpload