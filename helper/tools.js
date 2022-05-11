const fs = require('fs');
const path = require('path');

module.exports = {
    ensureFile: function (fileName, suggestedName) {
        //suggestedName = suggestedName || new Date().getTime() + "."
        if(!(path.extname(fileName))){                                                   
            fileName += fileName.endsWith('/') ? suggestedName : `/${suggestedName}`;                                 
        }      

        let fullpath = path.resolve(fileName),
            dir = path.dirname(fileName);                                                                   
    
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }       
        if (!fs.existsSync(fileName)) {
        // fs.closeSync(fs.openSync(filepath, 'w'));
            fs.writeFileSync(fileName, "", { flag: 'wx' });
        }
        return fileName;      
    },    

    fromCommandLineArg: function (name, argPrefix) {
        name = name.toLowerCase();
        var args = process.argv.slice(2).map(s => s.toLowerCase());
        return args.filter(a => a.split('=')[0]?.startsWith(`${argPrefix}${name}`))?.map(s => s.split('=').slice(1).join('='))[0];   
    }

  };
  