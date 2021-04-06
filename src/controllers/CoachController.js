const Coaches = require('../models/Coaches');
const HealthScores = require('../models/HealthScores');

class CoachController {
    static checkSignedInAsCoach(req, res, next) {
        if (req.session.coach) {
            next(); // If session exists, proceed to page
        } else {
            const err = new Error('Not logged in!');
            next(err); // Error, trying to access unauthorized page!
        }
    }

    static async show(req, res) {
        const healthScores = await HealthScores.getByCoachId(req.session.coach.id);
        res.render('coach/show', {
            healthScores
        });
    }

    static showLogin(req, res) {
        res.render('coach/login', {
            message: ''
        });
    }

    static async login (req, res) {
        if (!req.body.username || !req.body.password) {
            res.render('coach/login', {
                message: 'Please enter both id and password'
            });
        } else {

            const user = {
                username: req.body.username,
                password: req.body.password
            };

            const coach = await Coaches.login(user);
            if (coach) {
                req.session.coach = coach;
                res.redirect('/coach');
            } else {
                res.render('coach/login', {
                    message: 'Invalid credentials!'
                });
            }
        }
    }

    static async new (req, res) {
        if (!req.body.username || !req.body.password) {
            res.render('coach/login', {
                message: 'Please enter both id and password'
            });
        } else {
            await Coaches.createInitial(req.body.username, req.body.password);
            res.redirect('/admin');
        }
    }

    static async delete(req, res) {
        const coachId = await Coaches.getIdByUsername(req.body.username);
        await HealthScores.deleteByCoachId(coachId);
        await Coaches.delete(coachId);
        res.redirect('/admin');
    }

    static profile(req, res) {
        const coach =  {
            firstName: req.session.coach.firstName,
            lastName: req.session.coach.lastName,
            sport: req.session.coach.sport
        };
        console.log(coach);
        res.render('coach/profile', coach);
    }

    static async updateProfile(req, res) {
        const coach = await Coaches.update(req.session.coach.id, req.body);
        console.log('COACH', coach);
        req.session.coach = coach;
        res.redirect('/coach/profile');
    }

    static failedLoginRedirect (err, req, res, next) {
        res.redirect('/coach/login');
    }
};

module.exports = CoachController;