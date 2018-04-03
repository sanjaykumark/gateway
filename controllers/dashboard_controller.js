var mysql = require('mysql');
var bcrypt = require('bcrypt');
var configs = require('./../config.json');
var cookie = require('cookie');


var con = mysql.createPool({
    host:            configs.DB_HOST,
    connectionLimit: configs.CONNECTION_LIMIT,
    user:            configs.DB_USER,
    password:        configs.DB_PASSWORD,
    database: configs.DATABASE
  });
    
exports.show = function(req, res) {
    var uname=req.user.username;
    var sql = "SELECT * FROM `users` WHERE username=?";
    var query = con.query(sql,[uname] ,function(err, result) {
        if(err){
            console.log(err);
            res.send('Summa oru O/P');
        } 
        else{
            if(result);
              {
                res.render('dashboard',
                 {
                     username:result[0].username,
                     name:result[0].name,
                     email:result[0].email
                });
            }
            
        }
    });
    
  };

  exports.logout = function(req, res) {
    var token = req.cookies.AuthToken;
    if(token){
        res.clearCookie('AuthToken');
    }
   res.redirect('/');
   };
   
   function chkPassword(name,pass, fn)
   {
       var reslt;
       var sql = "SELECT * FROM `users` WHERE username = ?";
       var query = con.query(sql,[name] ,function(err, result) {
        if(err)
          res.send("Error");
        else if(result.length>0){
            var db_pass=result[0].password;
            bcrypt.compare(pass,db_pass,function(error,same){
              if(same)
              {
                reslt=true;
              }
              else
              {
                reslt=false;
              }
                fn(reslt);
            });
        }

     });
     
     
    }
   
   exports.checkPassword=function(req,res){
    
    var uname=req.params.name;
    var pass=req.params.pass;    
    console.log("Name "+uname+" Pass "+pass);
    chkPassword(uname,pass,function(exists){
       console.log(exists); 
       res.json({exists:exists});
    });
};

exports.changePassword=function(req,res){
    if(req.method == "POST"){
    var pass=req.body.password;   
    var uname=req.user.username;
    bcrypt.hash(pass, 5, function( err, bcryptedPassword){
    var sql = "UPDATE `users` SET password = ? WHERE username=?";
    var query = con.query(sql,[bcryptedPassword,uname] ,function(err, result) {
        if(err){
            console.log(err);
            
        } 
        else{
            if(result.affectedRows>0)
              {
                  res.redirect('/logout');
              }
    }
    });
});
  } 
};

exports.test1=function(req,res){
    res.send(''+req.app.locals.verify);
};
