module.exports = function(app) {

   //Setup Controllers
    userController = require('./../controllers/user_controller.js');
    dashboard = require('./../controllers/dashboard_Controller.js');

   //Set Routes
    app.route('/dashboard').get(userController.authenticate, dashboard.show);
    app.route('/logout').get(dashboard.logout);
    app.route('/checkpassword/:name/:pass').get(dashboard.checkPassword);
    app.route('/changepassword').post(dashboard.changePassword);    
    app.route('/register').post(userController.register);
    app.route('/login').post(userController.login);
    app.route('/checkusername/:name').get(userController.checkUser);
    app.route('/checkemail/:email').get(userController.checkEmail);
    app.get('/',goToHome);
    app.get('/home',goToHome);
    app.get('/verify/:id/:uname',userController.verify);
    app.get('/test1',dashboard.test1);
    app.get('*',function(req,res){
        res.render('error',{err:'Sorry Invalid URL'}) });
    
    function goToHome(req,res){
            res.render('home');}
};
