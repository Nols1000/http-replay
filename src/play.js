const fs = require('fs');
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const ora = require('ora');
const request = require('request');
const tingodb = require('tingodb');
const url = require('url');

const engine = tingodb();

const sInit = ora();
const sPlayer = ora();

momentDurationFormatSetup(moment);

module.exports = async (port, protocol, hostname, path, storage) => {

    sInit.start('Initializing storage...');

    if (!fs.existsSync(storage)) {
        fs.mkdirSync(storage);
    }

    const db = new engine.Db(storage, {});
    const records = db.collection('records');

    sInit.text = 'Loading data...';

    records.find().toArray((error, docs) => {
        if (error) {
            sInit.fail(error);
        } else {
            sInit.succeed('Ready!');
            sPlayer.start('Start playing...');

            const player = new Player(docs, port, protocol, hostname, path);

            player.registerProgressListener((position, duration) => {
                const positionString = moment.duration(position, 'milliseconds').format('h [hrs], m [min], s [secs]');
                const durationString = moment.duration(duration, 'milliseconds').format('h [hrs], m [min], s [secs]');

                sPlayer.text = `Playing recording (Time passed: ${positionString} | Duration: ${durationString})`
            });

            player.play();
        }
    });
}

class Player {

    constructor(records, port, protocol, hostname, path) {
        this.port = port;
        this.protocol = protocol;
        this.hostname = hostname;
        this.path = path;

        this.records = records;

        this.start = records[0].timestamp;
        this.end = records[records.length - 1].timestamp;
        this.duration = this.end - this.start;
        this.offset = Date.now() - this.start;

        this.progressListener = (position, duration) => { };
    }

    async play() {
        for (const record of this.records) {
            await this.playRecord(record);
        }
    }

    playRecord(record) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                request({
                    body: record.req.body,
                    headers: record.req.headers,
                    json: true,
                    method: record.req.method,
                    qs: record.req.query,
                    url: url.format({
                        protocol: this.protocol || record.req.protocol || 'http',
                        hostname: this.hostname || record.req.hostname || 'localhost',
                        port: this.port || 8080,
                        pathname: this.path || record.req.path || '/'
                    }),
                }, (error, response, body) => {});


                this.updateProgress(record);

                resolve();
            }, record.timestamp + this.offset - Date.now())
        })
    }

    updateProgress(record) {
        const position = record.timestamp - this.start;

        this.progressListener(position, this.duration);
    }

    registerProgressListener(progressListener) {
        this.progressListener = progressListener;
    }
}
