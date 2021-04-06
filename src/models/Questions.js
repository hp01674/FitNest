const { Connection, Request } = require('tedious');
const DatabaseConfiguration = require('./DatabaseConfiguration.json');

const config = {
    authentication: {
      options: {
        userName: DatabaseConfiguration.userName,
        password: DatabaseConfiguration.password
      },
      type: 'default'
    },
    server: DatabaseConfiguration.server,
    options: {
      database: DatabaseConfiguration.database,
      encrypt: true
    }
  };
const q = require('q');

class Questions {
    constructor() {}

    static new(label) {
        const deferred = q.defer();
        const connection = new Connection(config);
        connection.on('connect', function (err) {
            const query = `INSERT INTO Questions (Label) VALUES ('${label}')`;

            console.log(query);
            const request = new Request(query, function (err, rowCount) {
                if (err) { 
                    console.log(err);
                    deferred.resolve(false);
                }
            });

            request.on('doneProc', () => {
                deferred.resolve(true);
            });

            request.on('done', () =>{
                deferred.resolve(true);
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    static addOption(questionID, displayText, value) {
        const deferred = q.defer();
        const connection = new Connection(config);
        connection.on('connect', function (err) {
            const query = `INSERT INTO QuestionOptions (QuestionID, DisplayText, Score) VALUES (${questionID}, '${displayText}', ${value})`;

            console.log(query);
            const request = new Request(query, function (err, rowCount) {
                if (err) { 
                    console.log(err);
                    deferred.resolve(false);
                }
            });

            request.on('doneProc', () => {
                deferred.resolve(true);
            });

            request.on('done', () =>{
                deferred.resolve(true);
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    static getAllQuestions() {
        const result = [];
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`SELECT * FROM Questions`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('row', (columns) => {
                result.push({
                    id: columns[0].value,
                    label: columns[1].value,
                });
            });

            request.on('doneProc', () => {
                deferred.resolve(result);
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
        });

        return deferred.promise;
    }

    static getOptionsByQuestionID(questionID) {
        console.log(`SELECT DisplayText, Score FROM QuestionOptions WHERE QuestionID=${questionID}`);
        const result = [];
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`SELECT DisplayText, Score FROM QuestionOptions WHERE QuestionID=${questionID}`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('row', (columns) => {
                result.push({
                    displayText:columns[0].value,
                    value: columns[1].value
                });
            });

            request.on('doneProc', () => {
                deferred.resolve(result);
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
        });

        return deferred.promise;
    }

    static delete(questionID) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`DELETE FROM Questions WHERE ID=${questionID}`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('done', () => {
                deferred.resolve();
            });

            request.on('doneProc', () => {
                deferred.resolve();
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
        });

        return deferred.promise;
    }

    static deleteOptionsByQuestionID(questionID) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`DELETE FROM QuestionOptions WHERE QuestionID=${questionID}`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('done', () => {
                deferred.resolve();
            });

            request.on('doneProc', () => {
                deferred.resolve();
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
        });

        return deferred.promise;
    }

}

module.exports = Questions;