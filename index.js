const secrets = require('./secrets');
const knex = require('knex')({
        client: 'pg',
        connection: {
                host: 'localhost',
                user: secrets.dbUser,
                password: secrets.dbPass,
                database: 'hobbyfarm'
        }
});

knex.schema.hasTable('test').then(exists => {
        console.log('there is a test table!');
});
