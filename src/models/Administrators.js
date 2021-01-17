const {
    Connection,
    Request
} = require("tedious");
const DatabaseConfiguration = require('./DatabaseConfiguration.json');
const bcrypt = require('bcrypt');

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

class Administrators {
    constructor() {}

    static login(admin) {
        let result = undefined;
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            const query = `SELECT ID, Username, Password FROM Administrators WHERE Username='${admin.username}'`;
            const request = new Request(query, function (err, rowCount) {
                if (err ||rowCount === 0) {
                    deferred.resolve(result);
                }
            });

            request.on('row', async (columns) => {
                const password = admin.password;
                const hash = columns[2].value;
                const match = await bcrypt.compare(password, hash);
 
                if(match) {
                    result = {
                        id: columns[0].value,
                        username: columns[1].value
                    };
                }

                deferred.resolve(result);
            });

            connection.execSql(request);
        });

        connection.on("error", (error) => {
            console.log(error);
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    static create(username, password) {
        const deferred = q.defer();
        const connection = new Connection(config);

        connection.on('connect', function (err) {
            bcrypt.hash(password, 10, function (bcryptError, hash) {
                const query = `INSERT INTO Administrators (Username, Password) VALUES ('${username}', '${hash}')`;
                const request = new Request(query, function (err, rowCount) {
                    if (err) {
                        console.log(err);
                        deferred.resolve(false);
                    }
                });

                request.on("doneProc", () => {
                    deferred.resolve(true);
                })

                connection.execSql(request);
            });

        });

        connection.on("error", (error) => {
            console.log(error);
            deferred.resolve(false);
        });

        return deferred.promise;
    }
}

module.exports = Administrators;