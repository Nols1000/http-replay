const program = require('commander');

const record = require('./src/record');
const play = require('./src/play');

program
    .version('1.0.0');

program
    .command('play')
    .option('-p, --port [port]', 'Port to send the requests to')
    .option('-P, --protocol [protocol]', 'Protocol to send the requests with ("http" or "https")')
    .option('-H, --hostname [hostname]', 'Hostname to send the requests to')
    .option('-r, --path [path]', 'Path to rewrite the requests to')
    .option('-s, --storage [dir]', 'Directory to read the requests [./requests]', './requests')
    .action((cmd) => play(cmd.port, cmd.protocol, cmd.hostname, cmd.path, cmd.storage));

program
    .command('record')
    .option('-p, --port [port]', 'Port to listen for requests [8080]', 8080)
    .option('-s, --storage [dir]', 'Directory to store the requests [./requests]', './requests')
    .action((cmd) => record(cmd.port, cmd.storage));

program
    .parse(process.argv);


