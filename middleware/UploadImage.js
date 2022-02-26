const path = require("path")

const multer = require("multer")

const storeImg = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        // let ext = path.extname(file.originalname)
        // cb(null, file.originalname)
        cb(null, new Date().getTime() + path.extname(file.originalname))
    }
})

var uploadImage = multer({
    storage: storeImg,
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
            callback(null, true)
        } else {
            callback("Please Upload Valid Image File (JPG, JPEG OR PNG)", false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10
    }
})

module.exports = uploadImage