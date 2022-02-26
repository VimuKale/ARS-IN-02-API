// const firebaseAdmin = require('firebase-admin');
// const { config, cred } = require("../utils/firebase")

// const admin = firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(cred),
// });

// const storageRef = admin.storage().bucket(`gs://ars-in.appspot.com`);

// const random = (() => {
//     const buf = Buffer.alloc(16);
//     return () => randomFillSync(buf).toString('hex');
// })();

// const uploadImage = (req, res, db) => {

//     console.log(req.body)

//     const BusBoy = require("busboy");
//     const path = require("path");
//     const os = require("os");
//     const fs = require("fs");

//     let imageFileName;
//     let imageToBeUploaded = {};


//     const busboy = new BusBoy({ headers: req.headers });

//     busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
//         const imageExtension = filename.split(".")[filename.split(".").length - 1];
//         imageFileName = `${Math.round(Math.random() * 1000000)}.${imageExtension}`;
//         const filepath = path.join(os.tmpdir(), imageFileName);
//         imageToBeUploaded = { filepath, mimetype };
//         file.pipe(fs.createWriteStream(filepath))
//     });

//     busboy.on('finish', function () {
//         storageRef
//             .upload(imageToBeUploaded.filepath, {
//                 resumable: false,
//                 metadata: {
//                     contentType: imageToBeUploaded.mimetype,
//                 },
//             })
//             .then(() => {
//                 const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
//                 return db('image').insert({ url: imageUrl })
//             })
//             .then(() => {
//                 return res.json({ message: "Image uploaded successfully!" });
//             })
//             .catch((err) => {
//                 console.log(err);
//                 return res.status(500).json({ error: err.code });
//             });
//     });
//     return req.pipe(busboy);

// }

// module.exports = { uploadImage };