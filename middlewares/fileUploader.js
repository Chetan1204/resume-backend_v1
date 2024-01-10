const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination:(req, file, cb) => {
		cb(null, path.join(__dirname, "..", "public", "images"))
	},
	filename:(req, file, cb) => {
		const dt = new Date();
		cb(null, `${dt.getFullYear()}_${dt.getMonth()}_${file.originalname}`)
	}
});

const upload = multer({storage:storage});

module.exports = upload;


// const storage = multer.diskStorage({
//     destination:function(req, file, cb){
//         if(file.fieldname === 'banner' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
//             cb(null, path.join(__dirname,'../public/banners'));
//         }
//         // else if(file.field && (req.body?.imageMIME === 'image/jpg' || req.body?.imageMIME === 'image/png' || req.body?.imageMIME === 'image/jpeg')){
//         //     cb(null, path.join(__dirname,'../public/profile'));
//         // }
//         else if(file.fieldname === 'logo' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml')){
//             console.log('destination function')
//             cb(null, path.join(__dirname,'../public/logo'));
//         }
//         else if(file.fieldname === 'template' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
//             console.log('destination function, template img')
//             cb(null, path.join(__dirname,'../public/templates'));
//         }
//         else if(file.fieldname === 'filler_profileImage' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
//             console.log('destination function, template img')
//             cb(null, path.join(__dirname,'../public/profile'));
//         }
//         else {
//             cb(new Error('Invalid Form Field.'),false);
//         }
//     },
//     filename:function(req, file, cb){
//         const {username} = req.body;
//         let name;
//         console.log('Inside FIlename function', file.originalname, file.fieldname)
//         if(file.fieldname === 'banner'){
//              name = (username||"temp")+'_'+sanitizeFilename(file.originalname);
//         } else if( req.body.image){
//             name = (username||"temp")+'_'+ sanitizeFilename(req.body?.imageName);
//         } else if( file.fieldname === 'filler_profileImage'){
//             name = sanitizeFilename(file.originalname);
//         }else if( file.fieldname === 'logo'){
//             name = sanitizeFilename(file.originalname);
//         }  else if( file.fieldname === 'template'){
//             name = crypto.randomUUID().split('-').join("")+"."+file.originalname.split(".").pop();
//         } else{
//             name = sanitizeFilename(file.originalname);
//         }
//         console.log('in filename function:', file.originalname, file.fieldname)
//         cb(null, name);
//     }
// })

// const file_upload = multer({storage:storage, fileFilter:function(req,file,cb){
//     if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml'){
//         cb(null, true)
//     }
//     else if(req.body?.imageMIME === 'image/jpg' || req.body?.imageMIME === 'image/png' || req.body?.imageMIME === 'image/jpeg' || req.body?.imageMIME === 'image/svg+xml'){
//         cb(null, true)
//     }
//         else{
//         cb(new Error('File format Not Supported.'), false)
//     }
// }})
