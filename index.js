#! /usr/bin/env node

const argPrefix = '-';
const defaultConfigFileName = 'external-resources.json';

const shell = require("shelljs");
const fs = require('fs');
const path = require('path');
const http = require('http'); 
const https = require('https');

const cfgFile = readArg('config') || defaultConfigFileName;
const config = JSON.parse(fs.readFileSync(cfgFile));

function _(str) { // replaces all placeholders in str
    Object.keys(config?.placeholders).forEach(k => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), config.placeholders[k]);
    });
    return str;
}

function readArg(name) {
    name = name.toLowerCase();
    var args = process.argv.slice(2).map(s => s.toLowerCase());
    return args.filter(a => a.split('=')[0]?.startsWith(`${argPrefix}${name}`))?.map(s => s.split('=').slice(1).join('='))[0];    
}

function run() {
    return Promise.all(config.mappings.map(m => {
        return new Promise((resolve, reject)=> {
            let url = _(m.from),
                fileName = _(m.to),
                suggestedName = path.basename(url),
                dir = path.dirname(fileName);
            
            if(!(path.extname(fileName))){
                fileName += fileName.endsWith('/') ? suggestedName : `/${suggestedName}`;
            }       
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }       
            if (!fs.existsSync(fileName)) {
                fs.writeFileSync(fileName, "", { flag: 'wx' });
            }
            var file = fs.createWriteStream(fileName, {flag: 'wx'} );
            console.log("Read from " + url);        
            return (url.toLowerCase().startsWith('https') ? https : http).get(url, (response) => {     
                if (response.statusCode === 200)  {
                    console.log("Write to " + fileName);         
                    response.pipe(file);
                    resolve();
                } 
            });
        });
    }));    
}

shell.exec("echo using config file " + cfgFile);
run().then(() => console.log(`DONE ! Finished downloading ${config?.mappings?.length} external files !`));