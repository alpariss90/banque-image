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

    pool.query(
        "INSERT INTO activite (intitule, direction, categorie, who_done) VALUES ($1, $2, $3, $4)",
        [intitule, direction, categorie, req.hostname],
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

    const { categorie } = req.body;

    req.files.file.filter(item=>{
        fs.writeFile("./public/img/"+item.name,
        item.data, function(err){
            if(err){
               //return
            console.log('error '+err); 
            }

            


            //console.log('up ok');
            //console.log(item.name);
        });


        pool.query(
                "INSERT INTO image (intitule, activite, who_done) VALUES ($1, $2, $3)",
                ["/img/"+item.name, categorie, req.hostname],
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
          activite: activite
        })
      });
    }
    
    
  });
});

app.listen(4250);