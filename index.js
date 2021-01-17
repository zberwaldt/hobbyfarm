const yargs = require('yargs');
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

yargs.scriptName('hobbyfarm')
        .usage('$0 <cmd> [args]')
        .command('hello [name]', 'welcome ter yargs!', (yargs) => {
                yargs.positional('name', {
                        type: 'string',
                        default: 'Cambi',
                        describe: 'the name to say hello to',
                });
        }, (argv) => {
                console.log(`hello ${argv.name} welcome to yargs!`);
        })
        .help()
        .argv;

yargs.command('display [table]', 'show hobbyfarm', () => {}, async (argv) => {
                let data = await knex.select().table('test');
                console.log(data);
                process.exit(0);
        })
        .help().
        argv;
