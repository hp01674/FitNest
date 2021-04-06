const Administrators = require('../models/Administrators');
const Questions = require('../models/Questions');

class AdminController {
    static checkSignedInAsAdmin(req, res, next) {
        if (req.session.admin) {
            next(); // If session exists, proceed to page
        } else {
            const err = new Error('Not logged in!');
            next(err); // Error, trying to access unauthorized page!
        }
    }

    static async show(req, res) {
        const questions = await  Questions.getAllQuestions();
        res.render('admin/show', {
            questions: questions
        });
    }

    static showLogin(req, res) {
        res.render('admin/login', {
            message: ''
        });
    }

    static async login (req, res) {
        if (!req.body.username || !req.body.password) {
            res.render('admin/login', {
                message: 'Please enter both id and password'
            });
        } else {

            const user = {
                username: req.body.username,
                password: req.body.password
            };

            const admin = await Administrators.login(user);
            console.log(admin);
            if (admin !== undefined) {
                req.session.admin = admin;
                res.redirect('/admin');
            } else {
                res.render('admin/login', {
                    message: 'Invalid credentials!'
                });
            }
        }
    }

    static async new (req, res) {
        await Administrators.create(req.body.username, req.body.password);
        res.redirect('/admin');

    }

    static failedLoginRedirect (err, req, res, next) {
        res.redirect('/admin/login');
    }
};

module.exports = AdminController;