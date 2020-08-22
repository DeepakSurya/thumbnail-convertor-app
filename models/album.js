var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');



var albumSchema=new mongoose.Schema({
    username:String,
    title:String,
    description:String,
    gallery:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Upload'
    }]


});

albumSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('Album',albumSchema);
