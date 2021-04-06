const express = require('express');
const Coaches = require('./models/Coaches');

const path = require('path');
const multer = require('multer');

const upload = multer();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Administrators = require('./models/Administrators');
const HealthTrackingController = require('./controllers/HealthTrackingController');
const CoachController = require('./controllers/CoachController');
const AdminController = require('./controllers/AdminController');


const create = async () => {
    const app = express();

    app.engine('.html', require('ejs').__express);

    app.use(express.urlencoded({
        extended: true
    }));

    app.use(upload.array());
    app.use(cookieParser());
    app.use(session({ secret: 'Your secret key' }));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');

    app.get('/', HealthTrackingController.show);
    app.post('/new', HealthTrackingController.new);
    app.post('/healthtracking/migrate', HealthTrackingController.migrate);
    app.post('/healthtracking/question', HealthTrackingController.newQuestion);
    app.post('/healthtracking/option', HealthTrackingController.newOption);
    app.post('/healthtracking/question/delete', HealthTrackingController.deleteQuestion);

    app.get('/coach', CoachController.checkSignedInAsCoach, CoachController.show);
    app.get('/coach/login', CoachController.showLogin);
    app.post('/coach/login', CoachController.login);
    app.get('/coach/profile', CoachController.checkSignedInAsCoach, CoachController.profile);
    app.post('/coach/profile', CoachController.checkSignedInAsCoach, CoachController.updateProfile);
    app.post('/coach/new', AdminController.checkSignedInAsAdmin, CoachController.new);
    app.post('/coach/delete', AdminController.checkSignedInAsAdmin, CoachController.delete);

    app.get('/admin', AdminController.checkSignedInAsAdmin, AdminController.show);
    app.get('/admin/login', AdminController.showLogin);
    app.post('/admin/login', AdminController.login);
    app.post('/admin/new', AdminController.checkSignedInAsAdmin, AdminController.new);

    app.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/coach/login');
    });

    app.use('/admin', AdminController.failedLoginRedirect);
    app.use('/coach', CoachController.failedLoginRedirect);
    app.use('/coach/profile', CoachController.failedLoginRedirect);

    return app;
};



module.exports = {
    create
};