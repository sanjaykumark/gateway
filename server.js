//Initialise
 var express=require('express');
 var path=require('path');
 var app=express();
 var router = express.Router(); 
 var bodyParser=require("body-parser"); 
 var jwt = require('jsonwebtoken'); 
 var cookieParser = require('cookie-parser');
 var configs = require('./config.json');
 
 //Set Properties
 app.set('view engine','pug');
 app.set('views','./views');
 app.use(express.static(path.join(__dirname,'/static')));
 app.use(bodyParser.urlencoded({extended:true}));
 app.use(bodyParser.json());
 app.use(cookieParser())
 
app.use(function(req, res, next) {
    if (req.cookies && req.cookies.AuthToken) {
    var token = req.cookies.AuthToken;
    
      jwt.verify(token, configs.TOKEN_KEY, function(err, decode) {
        if (err) req.user = undefined;
    
        req.user = decode;
        next();
      });
    } else {
      req.user = undefined;
      next();
    }
  });

 //Router 
var routes = require('./routes/app_router');
routes(app);

//Deploy
app.listen(2010);
module.exports = app;
