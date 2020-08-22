var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var passport=require('passport');
var passportLocalMongoose=require('passport-local-mongoose');
var LocalStrategy=require('passport-local');
var session=require('express-session');
var cookieParser=require('cookie-parser');
var User=require('./models/user');
var Upload=require('./models/upload');
var Album=require('./models/album');

var userId;
var albumId;
var upload=require('express-fileupload');
var Jimp = require('jimp');
const path = require('path');
var fileName;

app.use(upload());
app.use(express.static('public'));


mongoose.connect('mongodb://localhost/galleryapp');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


app.use(session({
    secret:"My name is Deepak Surya",
    resave:false,
    saveUninitialized:false,
    maxAge: Date.now() + (30 * 86400 * 1000)
  //  cookie: { maxAge: 60000 }
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function(req, res){
 
    Upload.find(function(err,uploadDB){
        //console.log(uploadDB);
        res.render('dashboard',{uploads:uploadDB});

    })

 });

app.get('/login',function(req,res){
    //console.log(req.user);

    res.render('login');

});


app.post('/login',passport.authenticate('local'),function(req,res){

    User.findOne({username:req.body.username},function(err,found){
        if(err){
            //console.log(err);
        }else{
            res.redirect('/home/'+found._id);
        }

    });
});


app.get('/logout', function(req, res){
                req.logout();
               res.redirect('/');
               //console.log(req.user);
             });
            

app.get('/register',function(req,res){
    res.render('register');
})


app.post('/register',function(req,res){
 
     User.register(new User({username:req.body.username}),req.body.password,function(err,newCreatedUser){
         if(err){
             //console.log(err);
             return res.render('register');
         }else{
 
             newCreatedUser.phone=null;
             newCreatedUser.email=null;
             newCreatedUser.gender=null;
             newCreatedUser.description=null;
             newCreatedUser.position=null;

             //console.log(newCreatedUser);
 
             passport.authenticate("local")(req,res,function(){
                 res.redirect('/login');
             });
 
       
             
         }
       });
     
 });

 app.get('/home/:id',function(req,res){

    if(req.user){
        User.findById(req.params.id,function(err,found){
            if(err){
                //console.log(err);
            }else{
                res.render('home',{user:found});
                userId=req.params.id;
    
            }
    
        });
    }else{
        res.redirect('/login');

    }

        

 


});


app.get('/home/:id/edit',function(req,res){
    if(req.user){
        User.findById(req.params.id,function(err,found){
            res.render('info',{user:found});
            ////console.log(found);
            });
            
    }else{
        res.redirect('/login')
    }

});



app.post('/home/:id/edit',function(req,res){

    
  
    if(req.user){

        User.findById(userId,function(err,found){
            if(err){
                //console.log(err);
            }else{
            found.username=req.body.username;
            found.email=req.body.email;
            found.phone=req.body.phone;
            found.gender=req.body.gender;
            found.save();
            res.redirect('/home/'+userId);
    
            }
    
    
    
        });
    }else{
        res.redirect('/login')
    }
    
 




});

app.get('/home/:id/upload',function(req,res){
    
    if(req.user){
        res.render('upload',{id:req.params.id});
   
   
    }else{
        res.redirect('/login')
    }





});

app.get('/home/:id/gallery',function(req,res){
    
   // User.findOne({username:req.session.username}).populate('privateEvents').exec(function(err,userFound){
    if(req.user){
        User.findById(req.params.id).populate('uploads').exec(function(err,foundUser){
            res.render('gallery',{user:foundUser,albumId:albumId});
    
        });
  

    }else{
        res.redirect('/login')
    }

 
});

app.post('/home/:id/gallery',function(req,res){

    if(req.user){

                //console.log(req.files);
                
                var file=req.files.filename;
                var filename=file.name;
                fileName=filename;
                //console.log(filename);
                var fileSaveLocationOrginal='/upload/'+filename;
                file.mv('./public/upload/'+filename,function(err,suc){
                    if(err){console.log(err)}else{
                        console.log('dome');
                    }
                });
        
                var fileSaveLocationModified='/new/'+filename;
        
                Jimp.read('./public/upload/'+filename, (err, lenna) => {
                    if (err) throw err;
                    lenna
                      .resize(150, 112) // resize
                      .quality(40) // set JPEG quality
                      //.greyscale() // set greyscale
                      .write('./public/new/'+filename); // save
                  });
        
                  User.findById(userId,function(err,foundUser){
                   // foundUser.orginalUploads.push(fileSaveLocationOrginal);
                    //foundUser.modifiedUploads.push(fileSaveLocationModified);
                    //foundUser.save();
                    if(err){
                        console.log(err,'256');
                    }
                    Upload.create({
    
                        username:foundUser.username,
                        orginalUpload:fileSaveLocationOrginal,
                        modifiedUpload:fileSaveLocationModified
    
                    },function(err,created){
                        if(err){
                            console.log(err,'266');
                        }else{
                            //console.log(created);
                            created.save();
                            foundUser.uploads.push(created);
                            foundUser.save();
                            res.redirect('/home/'+userId+'/gallery');
    
                        }
                    });
    
                });
    
    
        
                
        
        
        
            }else{
                //console.log('no');
            }
    
});

app.get('/home/:id/gallery/:uploadId',function(req,res){
    
    if(req.user){
        User.findById(req.params.id).populate('uploads').exec(function(err,foundUser){
            Upload.findById(req.params.uploadId,function(err,found){
               res.render('show',{upload:found,id:req.params.id});

            })
    
        });
    }else{
        res.redirect('/login')
    }
         
   
 });
////////////////////////////////////////////////////////////////////////////////////////////////////////////
 app.get('/home/:id/myalbums',function(req,res){
    if(req.user){
        User.findById(req.params.id).populate('albums').exec(function(err,foundUser){

            res.render('album',{user:foundUser});
    
        });
    }else{
        res.redirect('/login')
    }
 });

 app.get('/home/:id/newalbum',function(req,res){
    if(req.user){
        res.render('newalbum',{userId:userId});

    }else{
        res.redirect('/login')
    }
});

app.post('/home/:id/myalbums',function(req,res){

    if(req.user){
        User.findById(userId,function(err,foundUser){
            Album.create({
                title:req.body.title,
                description:req.body.description,
                username:foundUser.username
            },function(err,created){
                foundUser.albums.push(created);
                foundUser.save();
                res.redirect('/home/'+foundUser._id+'/myalbums');
            });
        })
    }else{
        res.redirect('/login')
    }
    
});




app.get('/home/:id/myalbums/:album',function(req,res){
    if(req.user){
        albumId=req.params.album;
        Album.findById(req.params.album).populate('gallery').exec(function(err,found){
            res.render('albumgallery',{album:found,user:userId});
    
        })
    }else{
        res.redirect('/login')
    }
   
});

app.get('/home/:id/myalbums/:album/addtoalbum',function(req,res){
    if(req.user){
        User.findById(req.params.id).populate('albums').exec(function(err,foundUser){

            res.render('addtoalbum',{user:foundUser,albumId:albumId});
    
        });
    }else{
        res.redirect('/login')
    }

   
});

app.post('/home/:id/myalbums/:album',function(req,res){
   
    if(req.user){
        if(req.files){
            //console.log(req.files);
            
            var file=req.files.filename;
            var filename=file.name;
            fileName=filename;
            console.log(filename);
            var fileSaveLocationOrginal='/upload/'+filename;
            file.mv('./public/upload/'+filename,function(err,suc){
                if(err){console.log(err)}else{
                    console.log('dome');
                }
            });
    
            var fileSaveLocationModified='/new/'+filename;
    
            Jimp.read('./public/upload/'+filename, (err, lenna) => {
                if (err) throw err;
                lenna
                  .resize(150, 112) // resize
                  .quality(40) // set JPEG quality
                  //.greyscale() // set greyscale
                  .write('./public/new/'+filename); // save
              });
    
              User.findById(userId,function(err,foundUser){
 
                if(err){
                    console.log(err);
                }else{
                    Upload.create({

                        username:foundUser.username,
                        orginalUpload:fileSaveLocationOrginal,
                        modifiedUpload:fileSaveLocationModified
    
                    },function(err,created){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(created);
                            created.save();
                            foundUser.uploads.push(created);
                            foundUser.save();
                            
                            Album.findById(albumId,function(err,albumFound){
                               albumFound.gallery.push(created);
                                albumFound.save();
                                res.redirect('/home/'+userId+'/myalbums/'+albumId);
                               //console.log("albumFound",albumFound,'created',created);
                            });
                            
                            
                            
                    
    
                            
    
                        }
                    });
                }

               

            });


    
            
    
    
    
        }else{
            console.log('no');
        }
    }else{
        res.redirect('/login')
    }

        

   
});


app.listen(1010,function(){
    console.log('server on');
});

