#! /usr/bin/env node

const argPrefix = '-';
const defaultConfigFileName = 'external-resources.json';

const shell = require("shelljs");
const fs = require('fs');
const path = require('path');
const http = require('http'); 
const https = require('https');

var tools = require('./helper/tools');

const cfgFile = tools.fromCommandLineArg('config', argPrefix) || defaultConfigFileName;
const config = JSON.parse(fs.readFileSync(cfgFile));

function _(str, asArray) { // replaces all placeholders in str
    var keys = Object.keys(config?.placeholders);
    var result = [];
    keys.filter(k => !Array.isArray(config.placeholders[k])).forEach(k => {
        var value = config.placeholders[k];
        str = str.replace(new RegExp(`{${k}}`, 'g'), value);
    });
    result.push(str);
    if (asArray) {
        keys.filter(k => Array.isArray(config.placeholders[k]) && str.includes(`{${k}}`)).forEach(k => {
            var value = config.placeholders[k];             
            value.forEach(v => {
                result.push(str.replace(new RegExp(`{${k}}`, 'g'), v));
            });        
        });
        return result.filter(s => !keys.some(k => s.includes(`{${k}}`)));
    }
    
    return result[0];
}



function spread(mappings) {
    var keys = Object.keys(config?.placeholders).filter(k => Array.isArray(config.placeholders[k]));    
    var result = mappings.filter(m => !keys.some(k => m.from.includes(`{${k}}`) || m.to.includes(`{${k}}`)));
    mappings.filter(m => keys.some(k => m.from.includes(`{${k}}`) || m.to.includes(`{${k}}`))).forEach(m => {
        _(m.from, true).forEach((from,i)=> {
            result.push({
                from: from,
                to: _(m.to, true)[i] || _(m.to)
            });
        });
 
    });    
    //console.log(result); return [];
    return result;
}


function run(mappings) {
    return Promise.all(mappings.map(m => {
        return new Promise((resolve, reject)=> {
            let url = _(m.from);          
            (url.toLowerCase().startsWith('https') ? https : http).get(url, (response) => { 
                console.log("Read from " + url);    
                if (response.statusCode === 200)  {
                    (Array.isArray(m.to) ? m.to : [m.to]).forEach(to => {                        
                        _(to, true).forEach(f => {                            
                            var fileName = tools.ensureFile(f, path.basename(url));                                                                                                               
                            var file = fs.createWriteStream(fileName, {flag: 'wx'} );
                            console.log("Write to " + fileName);         
                            response.pipe(file);                     
                         }) ; 
                    });
                }
                resolve();                 
            });
        });
    }));    
}

shell.exec("echo using config file " + cfgFile);
var mappings = spread(config.mappings);
run(mappings).then(() => console.log(`DONE !!`));