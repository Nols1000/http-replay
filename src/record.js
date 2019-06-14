const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const ora = require('ora');
const tingodb = require('tingodb');

const app = express();
const engine = tingodb();

const sInit = ora();
const sRecorder = ora();

module.exports = (port, storage) => {
    sInit.start('Initializing storage...')

    if (!fs.existsSync(storage)) {
        fs.mkdirSync(storage);
    }
    
    const db = new engine.Db(storage, {});
    const records = db.collection('records');
    
    sInit.text = 'Initializing server...';

    let i = 0;
    
    app.use(bodyParser.json());
    
    app.all('*', (req, res) => {
        res.sendStatus(200);
    
        const record = {
            id: i,
            timestamp: Date.now(),
            req: {
                baseUrl: req.baseUrl,
                body: req.body,
                cookies: req.cookies,
                fresh: req.fresh,
                headers: req.headers,
                hostname: req.hostname,
                ip: req.ip,
                ips: req.ips,
                method: req.method,
                originalUrl: req.originalUrl,
                params: req.params,
                path: req.path,
                protocol: req.protocol,
                query: req.query,
                route: req.route,
                secure: req.secure,
                signedCookies: req.signedCookies,
                stale: req.stale,
                subdomains: req.subdomains,
                url: req.url,
                xhr: req.xhr,
            },
        }
        
        records.insert(record);

        sRecorder.text = `Waiting for requests... (recorded ${i})`;
        
        i++;
    });
    
    app.listen(port, () => {
        sInit.succeed(`Ready! Listening on ${port}`);
        sRecorder.start('Waiting for requests...')
    });
}
