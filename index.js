#! /usr/bin/env node

const argPrefix = '-';
const defaultConfigFileName = 'external-resources.json';

const shell = require("shelljs");
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const package = require('./package.json');
var tools = require('./helper/tools');

const cfgFile = tools.fromCommandLineArg('config', argPrefix) || defaultConfigFileName;
const config = JSON.parse(fs.readFileSync(cfgFile));

function _(str, asArray) { // replaces all placeholders in str
    const keys = Object.keys(config?.placeholders);
    let result = [];
    keys.filter(k => !Array.isArray(config.placeholders[k])).forEach(k => {
        let value = config.placeholders[k];
        str = str.replace(new RegExp(`{${k}}`, 'g'), value);
    });
    result.push(str);
    if (asArray) {
        keys.filter(k => Array.isArray(config.placeholders[k]) && str.includes(`{${k}}`)).forEach(k => {
            let value = config.placeholders[k];
            value.forEach(v => {
                result.push(str.replace(new RegExp(`{${k}}`, 'g'), v));
            });
        });
        return result.filter(s => !keys.some(k => s.includes(`{${k}}`)));
    }

    return result[0];
}



function spread(mappings) {
    const keys = Object.keys(config?.placeholders).filter(k => Array.isArray(config.placeholders[k])),
        result = mappings.filter(m => !keys.some(k => m.from.includes(`{${k}}`) || m.to.includes(`{${k}}`)));
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

function replaceResultReplacementsInStr(str, replacementCfg) {
    if (replacementCfg?.replacements) {
        const replacements = spread(Array.isArray(replacementCfg.replacements) ? replacementCfg.replacements : [replacementCfg.replacements]);
        console.log(replacements);
        replacements.forEach(r => {
            //str = str.replace(new RegExp(r.from, 'g'), r.to);
            str = str.replace(new RegExp(_(r.from), 'g'), _(r.to));
        });
    }
    return str;
}

function replaceResultReplacements(file, replacementCfg) {
    if (replacementCfg?.replacements) {
        return new Promise((resolve, reject) => {
            console.log("Replace in " + file.path);
            fs.readFile(file.path, 'utf-8', function (err,data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    const content = replaceResultReplacementsInStr(data, replacementCfg);
                    fs.writeFile(file.path, content, function (err) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(file);
                        }
                    });
                }
            });
        });
    }
    return Promise.resolve();
}

function run(mappings) {
    return Promise.all(mappings.map(m => {
        return new Promise((resolve, reject)=> {
            let url = _(m.from);
            (url.toLowerCase().startsWith('https') ? https : http).get(url, (response) => {
                console.log("Read from " + url);
                let file = null;
                if (response.statusCode === 200)  {
                    (Array.isArray(m.to) ? m.to : [m.to]).forEach(to => {
                        _(to, true).forEach(f => {
                            const fileName = tools.ensureFile(f, path.basename(url));
                            file = fs.createWriteStream(fileName, {flag: 'wx'} );
                            console.log("Write to " + fileName);
                            response.pipe(file);
                            //replaceResultReplacements(file, m);
                        });
                    });
                }
                resolve({
                    file: file,
                    cfg: m
                });
            });
        });
    }));
}

function replaceAllResultReplacements(fileResultArray) {
    return Promise.all(fileResultArray.map(f => replaceResultReplacements(f.file, f.cfg)));
}

shell.exec(`echo ${package.name} v${package.version} started`);
shell.exec("echo using config file " + cfgFile);

var mappings = spread(config.mappings);
run(mappings)
    .then(replaceAllResultReplacements)
    .then(() => console.log(`DONE !!`) );
