const {
    Connection,
    Request
} = require('tedious');
const DatabaseConfiguration = require('./DatabaseConfiguration.json');
const bcrypt = require('bcrypt');

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

class Coaches {
    constructor() {}

    static getAll() {
        const result = [];
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            if (err) console.log(err);
            const request = new Request('SELECT ID, FirstName, LastName, Username FROM Coaches', function (err, rowCount) {
                if (err) console.log(err);
            });

            request.on('row', (columns) => {
                result.push({
                    id: columns[0].value,
                    firstName: columns[1].value,
                    lastName: columns[2].value,
                    username: columns[3].value
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

    static getIdByUsername(username) {
        const result = [];
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`SELECT ID FROM Coaches WHERE Username='${username}'`, function (err, rowCount) {
                if (err) console.log(err);
            });

            request.on('row', (columns) => {
                deferred.resolve(columns[0].value);
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

    static login(coach) {
        let result;
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const query = `SELECT ID, Username, FirstName, LastName, Password, Sport FROM Coaches WHERE Username='${coach.username}'`;
            const request = new Request(query, function (err, rowCount) {
                if (err || rowCount === 0) {
                    deferred.resolve(result);
                }

            });

            request.on('row', async (columns) => {
                const {password} = coach;
                const hash = columns[4].value;
                const match = await bcrypt.compare(password, hash);

                if (match) {
                    result = {
                        id: columns[0].value,
                        username: columns[1].value,
                        firstName: columns[2].value,
                        lastName: columns[3].value,
                        sport: columns[5].value
                    };
                }

                deferred.resolve(result);
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    static createInitial(username, password) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            bcrypt.hash(password, 10, function (bcryptError, hash) {
                const query = `INSERT INTO Coaches (Username, Password) VALUES ('${username}', '${hash}')`;
                const request = new Request(query, function (err, rowCount) {
                    if (err) {
                        console.log(err);
                        deferred.resolve(false);
                    }
                });

                request.on('doneProc', () => {
                    deferred.resolve(true);
                });

                connection.execSql(request);
            });

        });

        connection.on('error', (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    static update(coachId, coach) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const query = `UPDATE Coaches
                SET FirstName='${coach.firstName}', LastName='${coach.lastName}', Sport='${coach.sport}'
                WHERE ID=${coachId};`;
            const request = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    deferred.resolve();
                }
            });

            request.on('doneProc', () => {
                deferred.resolve({
                    id: coachId,
                    firstName: coach.firstName,
                    lastName: coach.lastName ,
                    sport: coach.sport,

                });
            });

            connection.execSql(request);
        });

        connection.on('error', (error) => {
            console.log(error);
            deferred.resolve();
        });

        return deferred.promise;
    }

    static delete(coachId) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const request = new Request(`DELETE FROM Coaches WHERE ID=${coachId}`, function (err, rowCount) {
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

module.exports = Coaches;