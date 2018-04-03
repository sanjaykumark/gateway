//Modules
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var configs = require('./../config.json');
var jwt = require('jsonwebtoken');
var nodemailer = require("nodemailer"); 

//DB Connection
var con = mysql.createPool({
  host:            configs.DB_HOST,
  connectionLimit: configs.CONNECTION_LIMIT,
  user:            configs.DB_USER,
  password:        configs.DB_PASSWORD,
  database: configs.DATABASE
});

//Mailer
var smtpTransport = nodemailer.createTransport({
  service:configs.SERVICE,
  auth: {
      user: configs.MAIL_ID,
      pass: configs.MAIL_PASSWORD
  }
});
//Methods
exports.login=function(req,res){
    if(req.method == "POST"){
      var uname = req.body.username;
      var pass= req.body.password;
      var uname_err,pass_err;
  
          var sql = "SELECT * FROM `users` WHERE username=?";
          var query = con.query(sql,[uname] ,function(err, result) {
            if(err)
              res.send("Error");
            else if(result.length>0) {
              if(result[0].active==1)
              {
                var db_pass=result[0].password;
                bcrypt.compare(pass,db_pass,function(err,same){
                  var jwt_id=result[0].id+""+Date.now();
                  if(same)
                  {

                    res.cookie('AuthToken',jwt.sign({id:jwt_id ,username: result[0].username,name: result[0].name,}, configs.TOKEN_KEY), { maxAge: 1000*60*60*24*7, httpOnly: true })
                    res.redirect('/dashboard')
                  }
                  else
                  {
                    res.render('home',{message:'Wrong Password'});
                  }

                });
              }
              else
              {
                res.render('home',{message:'Email not verified'});
              }

            }
            else
            {
              res.render('home',{message:'Username Invalid'});
            }
        
            });
  }
};



exports.register=function(req , res){
        if(req.method == "POST"){
            
          var name  = req.body.name;
            var uname = req.body.username;
            var pass= req.body.password;
            var conpass= req.body.repassword;
            var email  = req.body.email;
            var name_err,uname_err,pass_err,conpass_err,email_err;
            var letters = /^[A-Za-z]+$/;

            if(!(letters.test(name)&&(name.length>4)))
              name_err="Invalid or short name";
            
              chkUsr(name,function(exists){
              if(exists==true)
                uname_err="Username already exists";
            });

            if(pass.length<8)
              pass_err="Small Password";

            if(pass!=conpass)
              conpass_err="Passwords not matched";
            
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
              email_err="Invalid email";
              chkEmail(email,function(exists){
                if(exists==true)
                  email_err="Email already exists";
              });
  
            
            if(name_err==undefined && uname_err==undefined && pass_err==undefined && conpass_err==undefined && email_err==undefined )   
            {
              bcrypt.hash(pass, 5, function( err, bcryptedPassword){
              var sql = "INSERT INTO `users`(`name`,`username`, `password`,`email` ) VALUES (?,?,?,?)";
              var query = con.query(sql, [name,uname,bcryptedPassword,email],function(err, result) {
                if(!err)
                {
                  var rand=Math.floor((Math.random() * 100) + 54);
                  var host=req.get('host');
                  var link="http://"+req.get('host')+"/verify/"+rand+"/"+uname;
                  req.app.locals.verify_no=rand;
                  mailOptions={
                      to : email,
                      subject : "Gateway - Please confirm your Email account",
                      html : "<div style='background-color:black;color:white;text-align:left;width:100%;height:10vh;font-size:1em;'>Gateway</div><center><div style='margin-top:5%;font-size:2em;'>Welcome "+name+"</div><div style='margin-top:5%;'>You're almost there! Please click on the button your email address.</div><div style='margin-top:5%;'><a style='text-decoration:none;padding:20px;background-color:cadetblue;color:white' href='"+link+"'>Confirm your email </a></div> </center>"
                    }
                    smtpTransport.sendMail(mailOptions, function(error, response){
                      if(error){
                             console.log(error);
                         res.end("error");
                      }else{
                             console.log("Message sent: " + response.message);
                         res.end("sent");
                          }
                 });
                  res.render('home',{message:'You are successfully registered!\nVerify your email'});
              }
                
                else
                {
                  res.send('Error');
                  console.log(err);
                }
                });   
              });
            }
            else
            {
              res.render('home',{name_err:name_err,
                uname_err:uname_err,
                pass_err:pass_err,
                conpass_err:conpass_err,
                email_err:email_err
              });
              
            }
            }
    }; 

exports.authenticate=function(req,res, next){
  if(req.user)
    return next()
  
  return res.redirect('/home')
    
};

function chkUsr(name, fn)
{
    var reslt;
    var sql = "SELECT * FROM `users` WHERE username = ?";
    var query = con.query(sql, [name], function(err, result,fields) {
      if(!err)
      {  if(result.length>0)
          reslt=true;
        else
        reslt=false
      }
      else
      {
        console.log(err);
      } 
    fn(reslt)
    });
    
}
function chkEmail(email, fn)
{
    var reslt;
    var sql = "SELECT * FROM `users` WHERE email = ?";
  
    var query = con.query(sql, [email], function(err, result,fields) {
      if(!err)
      {  if(result.length>0)
         {
             reslt=true;
         }
        else
        {
        reslt=false
  
      }
      }
      else
      {
        console.log(err);
      } 
    fn(reslt)
    });
    
}
exports.checkUser=function(req,res){ 
    var name=req.params.name;
    chkUsr(name,function(exists){
      res.json({exists: exists})
    });
          };

exports.checkEmail=function(req,res){ 
  var email=req.params.email;
  chkEmail(email,function(exists){    
    res.json({exists: exists})
  });
    };

    exports.verify=function(req,res){ 
      var host=req.get('host');
      //Domain is matched
      if((req.protocol+"://"+req.get('host'))==("http://"+host))
      {
          var num=req.params.id;
          var name=req.params.uname;
          if(num==req.app.locals.verify_no)
          {
            var sql = "UPDATE `users` SET active = 1 WHERE username=?";
            var query = con.query(sql,[name] ,function(err, result) {
                if(err){
                    console.log(err);
                    
                } 
                else{
                    if(result.affectedRows>0)
                      {            
                        res.redirect('/');
                      }
                    }
                  });    
          }
          else
          {
              console.log("email is not verified");
              res.end("<h1>Bad Request</h1>");
          }
      }
      else
      {
          res.end("<h1>Request is from unknown source");
      }    

    };
  