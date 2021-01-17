const { Connection, Request } = require("tedious");
const DatabaseConfiguration = require('./DatabaseConfiguration.json');

const config = {
    authentication: {
      options: {
        userName: DatabaseConfiguration.userName,
        password: DatabaseConfiguration.password
      },
      type: "default"
    },
    server: DatabaseConfiguration.server,
    options: {
      database: DatabaseConfiguration.database,
      encrypt: true
    }
  };
const q = require('q');

class HealthScores {
    constructor() {}

    static save(healthScore) {
        const deferred = q.defer();
        const connection = new Connection(config);
        connection.on('connect', function (err) {
            const query = `INSERT INTO HealthScores (CoachID, FirstName, LastName, Score) VALUES (${healthScore.coach}, '${healthScore.firstName}', '${healthScore.lastName}', ${healthScore.score})`

            console.log(query);
            const request = new Request(query, function (err, rowCount) {
                if (err) { 
                    console.log(err);
                    deferred.resolve(false);
                }
            });

            request.on("doneProc", () => {
                deferred.resolve(true);
            });

            request.on("done", () =>{
                deferred.resolve(true);
            })

            connection.execSql(request);
        });

        connection.on("error", (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    static getByCoachId(coachId) {
        const result = [];
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`SELECT * FROM HealthScores WHERE CoachID=${coachId}`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('row', (columns) => {
                const date = new Date(columns[5].value);
                result.push({
                    id: columns[0].value,
                    coachid: columns[1].value,
                    firstName: columns[2].value,
                    lastName: columns[3].value,
                    score: columns[4].value,
                    date: date.toLocaleDateString("en-us")
                });
            });

            request.on("doneProc", () => {
                const byDate = (a, b) => { b.date - a.date };
                deferred.resolve(result.sort(byDate));
            })

            connection.execSql(request);
        });

        connection.on("error", (error) => {
            console.log(error);
        });

        return deferred.promise;
    }


    static deleteByCoachId(coachId) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`DELETE FROM HealthScores WHERE CoachID=${coachId}`, function (err, rowCount) {
                if (err) console.log(err);
            });


            request.on('done', () => {
                deferred.resolve();
            });

            request.on("doneProc", () => {
                deferred.resolve();
            })

            connection.execSql(request);
        });

        connection.on("error", (error) => {
            console.log(error);
        });

        return deferred.promise;
    }

    static migrate (fromId, toId) {
        const deferred = q.defer();
        const connection = new Connection(config);
        connection.on('connect', function (err) {
            const query = `UPDATE HealthScores SET CoachID=${toId} WHERE CoachID=${fromId};`;
            const request = new Request(query, function (err, rowCount) {
                if (err) { 
                    console.log(err);
                    deferred.resolve(false);
                }
            });

            request.on("doneInProc", () => {
                deferred.resolve(true);
            });

            request.on("doneProc", () => {
                deferred.resolve(true);
            });

            request.on("done", () =>{
                deferred.resolve(true);
            })

            connection.execSql(request);
        });

        connection.on("error", (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }
}

module.exports = HealthScores;