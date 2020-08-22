var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');



var uploadSchema=new mongoose.Schema({
    username:String,
    orginalUpload:String,
    modifiedUpload:String

});

uploadSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Upload',uploadSchema);
