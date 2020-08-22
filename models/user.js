var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');



var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    phone:String,
    gender:String,
    uploads:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Upload'
    }],
    albums:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Album'
    }]

});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);
