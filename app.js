var express=require('express');
var app=express();
var upload=require('express-fileupload');
var Jimp = require('jimp');
const path = require('path');

var fileName;


app.use(express.static('public'));

app.use(upload());


app.get('/', function(req,res){
    res.sendFile(path.join(__dirname+'/form.html'));
});

app.get('/view', function(req,res){
    res.render('view.ejs',{fileName:fileName});
});



app.post('/',function(req,res){
    if(req.files){
        console.log(req.files);
        var file=req.files.filename;
        var filename=file.name;
        fileName=filename;
        console.log(filename);
        file.mv('./public/upload/'+filename,function(err,suc){
            if(err){console.log(err)}else{
                console.log('dome');
            }
        });

        Jimp.read('./public/upload/'+filename, (err, lenna) => {
            if (err) throw err;
            lenna
              .resize(75, 75) // resize
              .quality(40) // set JPEG quality
              //.greyscale() // set greyscale
              .write('./public/new/'+filename); // save
          });

          res.redirect('/view');

    }else{
        console.log('no');
    }
})

app.listen(1010,function(){
    console.log('server on');
});

