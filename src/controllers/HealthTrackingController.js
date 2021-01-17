const Coaches = require('../models/Coaches');
const HealthScores = require('../models/HealthScores');
const FormConfiguration = require('../FormConfiguration.json');

class HealthTrackingController {
    static async show(req, res) {
        const coaches = await Coaches.getAll();

        res.render('healthtracking/form', {
            coaches: coaches,
            waterOptions: FormConfiguration.waterOptions
        });
    }

    static async new(req, res) {
        const score = parseInt(req.body.waterScore);

        const healthScore = {
            coach: parseInt(req.body.coach),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            score: score
        }

        const success = await HealthScores.save(healthScore);

        res.render('healthtracking/new', {
            success: success
        });
    }

    static async migrate(req, res) {
        const fromCoachId = await Coaches.getIdByUsername(req.body.from);
        const toCoachId = await Coaches.getIdByUsername(req.body.to);
        await HealthScores.migrate(fromCoachId, toCoachId);
        res.redirect('/admin');
    }
};

module.exports = HealthTrackingController;