const Coaches = require('../models/Coaches');
const HealthScores = require('../models/HealthScores');
const Questions  = require('../models/Questions');
const FormConfiguration = require('../FormConfiguration.json');

class HealthTrackingController {
    static async show(req, res) {
        const coaches = await Coaches.getAll();
        const questions = await Questions.getAllQuestions();
        console.log(questions);
        for(let question of questions) {
            console.log(question);
            const options = await Questions.getOptionsByQuestionID(question.id);
            question.options = options;
        }

        res.render('healthtracking/form', {
            coaches,
            questions: questions,
        });
    }

    static async new(req, res) {
        let requestBody = Object.assign({}, req.body);
        delete requestBody['coach'];
        delete requestBody['firstName'];
        delete requestBody['lastName'];

        let sum = 0;
        for (const [key, score] of Object.entries(requestBody)) {
            sum += parseInt(score);
        }

        const healthScore = {
            coach: parseInt(req.body.coach),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            score:  sum
        };

        const success = await HealthScores.save(healthScore);

        res.render('healthtracking/new', {
            success
        });
    }

    static async migrate(req, res) {
        const fromCoachId = await Coaches.getIdByUsername(req.body.from);
        const toCoachId = await Coaches.getIdByUsername(req.body.to);
        await HealthScores.migrate(fromCoachId, toCoachId);
        res.redirect('/admin');
    }

    static async newQuestion(req, res) {
        const questionLabel = req.body.questionLabel;
        await Questions.new(questionLabel);
        res.redirect('/admin');
    }

    static async deleteQuestion(req, res) {
        const questionToDelete = req.body.selectedQuestion;
        await Questions.deleteOptionsByQuestionID(questionToDelete);
        await Questions.delete(questionToDelete);
        res.redirect('/admin');
    }

    static async newOption(req, res) {
        const questionID = req.body.selectedQuestion;
        const displayText = req.body.optionDisplayText;
        const value = req.body.optionValue;
        await Questions.addOption(questionID, displayText, value);
        res.redirect('/admin');
    }
};

module.exports = HealthTrackingController;