const Administrators = require("../models/Administrators");

class AdminController {
    static checkSignedInAsAdmin(req, res, next) {
        if (req.session.admin) {
            next(); //If session exists, proceed to page
        } else {
            var err = new Error("Not logged in!");
            next(err); //Error, trying to access unauthorized page!
        }
    }

    static async show(req, res) {
        res.render('admin/show');
    }

    static showLogin(req, res) {
        res.render('admin/login', {
            message: ""
        });
    }

    static async login (req, res) {
        if (!req.body.username || !req.body.password) {
            res.render('admin/login', {
                message: "Please enter both id and password"
            });
        } else {

            const user = {
                username: req.body.username,
                password: req.body.password
            }

            const admin = await Administrators.login(user);
            console.log(admin);
            if (admin !== undefined) {
                req.session.admin = admin;
                res.redirect('/admin');
            } else {
                res.render('admin/login', {
                    message: "Invalid credentials!"
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