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

// set up yargs.
yargs.scriptName('hobbyfarm')
        .usage('$0 <cmd> [args]')
//        .command('hello [name]', 'welcome ter yargs!', (yargs) => {
//                yargs.positional('name', {
//                        type: 'string',
//                        default: 'Cambi',
//                       describe: 'the name to say hello to',
//                });
//        }, (argv) => {
//                console.log(`hello ${argv.name} welcome to yargs!`);
//        })
//        .help()
//        .argv;

// get all rows in table.
yargs.command('display [table]', 'show hobbyfarm', (yargs) => {
                        yargs.positional('table', {
                                type: 'string',
                                describe: 'the table to display'
                        });
                },
                async (argv) => {

                        if(argv.table) {

                                let tableExists = await knex.schema.hasTable(argv.table);
                                if (tableExists) {
                                        let query = await knex(argv.table).count('id');
                                        let count = parseInt(query[0].count, 16); 

                                        if (count < 1) { 
                                                console.log('no data in table');
                                                process.exit(0);
                                        } else { 
                                                let data = await knex.select().table(argv.table);
                                                console.table(data);
                                                process.exit(0);
                                        }

                                } else {

                                        console.log('no such table');
                                        process.exit(0);

                                }

                        } else {
                                console.log('no name was provided');
                        }
                });

// add to table.
yargs.command('add [table] [name] [count]', 'add new data to table',
        (yargs) => {
                yargs.positional('table', {
                        type: 'string',
                        describe: 'the table to add to',
                });
                yargs.positional('name', {
                        type: 'string',
                        describe: 'the name of the item',
                });
                yargs.positional('count', {
                        type: 'number',
                        describe: 'how many of item',
                        default: 0
                });
        },
        async (argv) => {
                let stamp = new Date();
                let tableExists = await knex.schema.hasTable(argv.table);
                if(!tableExists) {
                        console.log(`${argv.table} doesn't exist`);
                        process.exit(0);
                } else {
                        try {
                                console.log('insert into db');
                                await knex.insert([{ name: argv.name, total: argv.count }]).into(argv.table).onConflict('name').merge({ total: argv.count, updated_at: stamp.toISOString() })
                                process.exit(0);

                        } catch (e) {
                        
                                console.error(e);
                                process.exit(0);

                        }
                }
        });

yargs.command('purge [table]', 'purge the table',
        (yargs) => {
                yargs.positional('table', {
                        type: 'string',
                        describe: 'the table to purge'
                });
        },
        async (argv) => {
                let tableExists = await knex.schema.hasTable(argv.table);
                if(!tableExists) {
                        console.log(`${argv.table} doesn' exist`);
                        process.exit(0);
                } else {
                        try {
                                console.log('purging table...');
                                let purged = await knex.schema.dropTable(argv.table);
                                console.log(purged);
                                process.exit(0);
                        } catch (e) {
                                console.error(e);
                                process.exit(0);
                        }
                }
        });
                
// initialize hobbyfarm.
yargs.command('init', 'initialize hobbyfarm', () => {}, async (argv) => {

                let tableExists = await knex.schema.hasTable('seeds');
                
                if(!tableExists) {
                        let newTable = await knex.schema.createTable('seeds', t => {
                                        t.increments('id').primary();
                                        t.text('name', 100);
                                        t.unique('name');
                                        t.text('bio');
                                        t.integer('total');
                                        t.timestamps(false, true);
                        });
                        console.log(newTable);
                        process.exit(0);
                } else {
                        console.log('table already exists');
                        process.exit(0);
                }

         })
        .help()
        .argv;
