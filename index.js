const express = require("express");
var app=express();
var bodyParser=require('body-parser');
var fileUpload=require('express-fileupload');
var fs=require('fs');
var pool=require('./service/provider');



app.use(fileUpload());
app.set('view engine', 'twig');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', './views');

app.use('/img', express.static(__dirname+'/public/img'));

app.get('/', function(req, res){
  
    pool.query(
        "SELECT * FROM activite",
        [],
        (error, results) => {
          if (error) {
            throw error;
          }
    
          return res.render('activite', {
              activites: results.rows
          })
        }
      );
   
});

app.post('/add-activite',(req, res)=>{
    const { intitule, direction, categorie } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    


    pool.query(
        "INSERT INTO activite (intitule, direction, categorie, who_done) VALUES ($1, $2, $3, $4)",
        [intitule, direction, categorie, ip],
        (error, results) => {
          if (error) {
            throw error;
          }
    
          res.redirect('/');
        }
      );
    
});

app.get('/form-upload', function(req, res){
    pool.query(
        "SELECT * FROM activite",
        [],
        (error, results) => {
          if (error) {
            throw error;
          }
    
          return res.render('test', {
              activites: results.rows
          })
        }
      );
});

app.post('/upload-file', function(req, res){

  //console.log(req.body);
  
    const { categorie } = req.body;
    try {
      // first check if directory already exists
      if (!fs.existsSync("./public/img/"+categorie)) {
          fs.mkdirSync("./public/img/"+categorie);
          console.log("Directory is created.");
      } else {
          console.log("Directory already exists.");
      }
  } catch (err) {
      console.log(err);
  }
    

    
    req.files.file.filter(item=>{
        fs.writeFile("./public/img/"+categorie+"/"+item.name,
        item.data, function(err){
            if(err){
               //return
            console.log('error '+err); 
            }
        });
        var chemin='/img/'+categorie+'/'+item.name;

        pool.query(
                "INSERT INTO image (intitule, activite, who_done) VALUES ($1, $2, $3)",
                [chemin, categorie, req.hostname],
                (error, results) => {
                  if (error) {
                    throw error;
                  }
            
                  //res.redirect('/');
                }
              );


    });
    res.redirect('/');
});


app.get('/banque/:activite?', (req, res)=>{
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if(req.params.activite){
    requete='select * from v_image where id=$1';
    p=[req.params.activite];
  }else{
    requete='select * from v_image';
    p=[];
  }
  pool.query(requete,
  p,
  (err, result)=>{
    if(err){
      console.log('/banque '+err);
    }else{
      pool.query('select * from activite',[], (er, rs)=>{
        let activite={};
        if(req.params.activite){
          activite=rs.rows.filter(item=>item.id==req.params.activite)[0];
        } 
      
        res.render('liste', {
          images: result.rows,
          activites: rs.rows,
          activite: activite,
          ip: ip
        })
      });
    }
    
    
  });
});

app.get('/download/:image', function(req, res){
  pool.query(
    "SELECT * FROM image where id=$1",
    [req.params.image],
    (error, results) => {
      if (error) {
        throw error;
      }
      
      res.download('./public'+results.rows.shift().intitule, function(err) {
        if(err) {
            console.log(err);
        }
    })
    }
  );
  
});


app.get('/delete/:image', function(req, res){
  pool.query(
    "SELECT * FROM image where id=$1;",
    [req.params.image],
    (error, results) => {
      if (error) {
        throw error;
      }
      fs.unlinkSync('./public'+results.rows.shift().intitule);
      pool.query(
        "delete from image where id=$1",
        [req.params.image],
        (error, results) => {
          if (error) {
            throw error;
          }
    
          res.redirect('/banque');
        }
      );

      
    })
    }
  );
  


app.listen(4010, ()=>{
    console.log('App listen at port 4010');
})

app.listen(4250);
