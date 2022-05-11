# remote-dependencies
Simple tool to have mapping for remote files to download them locally

### Step 1 Install package 

```cmd
npm install --save-dev @fgilde/remote-dependencies
```

### Step 2 Create config file

Create a json file in your stucture default filename is `external-resources.json`

#### Sample config
```json
{
    "placeholders": { // Placeholders are optional
        "remote": "https://sw-theme-studio.labs.sabio.de",
        "theme" : "material",
        "localDir": "./external-assets"
    },
    "mappings" : [ // Your mappings
        {
            "from": "{remote}/theme/{theme}/scss/" ,
            "to": "{localDir}/mysuper.scss"
        },
        {
            "from": "{remote}/theme/bootstrap/scss/" ,
            "to": "{localDir}/bootstrap.scss"
        },
        {
            "from": "https://www.golem.de/staticrl/images/logo-g.png" ,
            "to": "{localDir}"
        }
    ]
}
```

### Step 3 Use it
The command to execute is `update-remotes`
> (Note) you can specify a seperate config file with `-config`
for example 
```
    update-remotes -config="./yourpath/yourconfigfile.json"
```

Now you can add the reusable command as an npm run script. Open the `package.json`and create a custom command as you want
```json
"scripts": {
  "build": "...",
  "load-external-dependencies": "update-remotes"
},
```

To run this script before run build in package.json file, you just add prebuild in script like this:

```json
 "scripts": {    
    "build": "...",
    "prebuild": "npm run load-external-dependencies",
    "load-external-dependencies": "update-remotes"
  },
```

### After running you should have the following structure for this example in your project

    
    ├── external-resources      # Your new direcrtory
    ├─-─ bootstrap.scss         # First Mapping
    ├─-─ logo-g.png             # Third Mapping
    ├─-─ mysuper.scss           # Second Mapping
  
