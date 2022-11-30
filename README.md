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
        "remote": "https://sw-theme-studio.azurewebsites.net",
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
  


# Some special features

### Multiple Outputs
 You can write one response in multiple output files just by using an array for the `to` config inside a mapping
```json
    "mappings" : [
        ...
        {
            "from": "https://www.golem.de/staticrl/images/logo-g.png" ,
            "to": ["{localDir}", "{localDir}/the-logo.png"]
        }
    ],
```
> This sample will create two local files `external-assets\logo-g.png` and `external-assets\the-logo.png`

<br>
<br>

#
### Multiple placeholders

Your placeholder can also have an string array as value. 
> See property `components` in this example

```json
    "placeholders": {        
        "remote": "https://sw-theme-studio.azurewebsites.net",
        "theme" : "material",
        "localDir": "./external-assets",                
        "components": ["grid", "pivotview", "button"]
    },
    "mappings" : [        
        {
            "from": "{remote}/theme/{theme}/css/{components}" ,            
            "to": "{localDir}/{theme}/components/css/_{components}.css"
        }                       
    ]
```
> The config above will then make 3 requests with one mapping config 
<br>
`https://sw-theme-studio.azurewebsites.net/theme/material/css/grid` 
to `./external-assets/material/components/css/_grid.css`
<br>
`https://sw-theme-studio.azurewebsites.net/theme/material/css/pivotview` 
to `./external-assets/material/components/css/_pivotview.css`
<br>
`https://sw-theme-studio.azurewebsites.net/theme/material/css/button` 
to `./external-assets/material/components/css/_button.css`
<br>

### File Result Replacements
Replacements on file results are new since v1.0.4. And can be configured on a mapping like this

```json
{
  "placeholders": {
    "localDir": "./src/scss/external",
    "fontDir": "./src/scss/fonts",
    "materialIconFontUrl": "https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ",
    ...
  },
  "mappings": [
    ...
    {
      "form": "{srcUrl}",
      "to": "{localDir}",
      "replacements": [
        {
          "from": "toReplace",
          "to": "replaced"
        }
      ]
    },
    {
      "from": "https://fonts.googleapis.com/icon?family=Material+Icons",
      "to": "{localDir}/material-icons.css",
      "replacements": [
        // File Result replacements can also resolve placeholders
        {
          "from": "{materialIconFontUrl}",
          "to": "{fontDir}/material-icons"
        }
      ]
    }
  ]
}
```

### Real case szenario

This tool can be usefully for example to be legal conform for GDPR/DSGVO requirements.
In this example we want to download all css and font files from some third party websites and store them locally.
Here in this case we resolve general material-components-web.css, font-awesome, google material icons and Open Sans from googlefonts api to ensure all resources are available locally and to besure to be GDPR conform 

```json
{
  "placeholders": {
    "localDir": "./src/scss/external",
    "fontDir": "./src/scss/fonts",
    "materialIconFontUrl": "https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ",
    "openSansFonts": ["memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0B4gaVc.ttf", "memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf", "memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVc.ttf"],
    "fontFiles": ["fontawesome-webfont.eot", "fontawesome-webfont.woff2", "fontawesome-webfont.woff", "fontawesome-webfont.ttf", "fontawesome-webfont.svg"]
  },
  "mappings" : [
    {
      "from": "https://unpkg.com/material-components-web@4.0.0/dist/material-components-web.min.css" ,
      "to": "{localDir}/material-components-web.min.css"
    },
    {
      "from": "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" ,
      "to": "{localDir}/font-awesome.min.css"
    },
    {
      "from": "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/fonts/{fontFiles}" ,
      "to": "{fontDir}"
    },
    {
      "from": "{materialIconFontUrl}.ttf" ,
      "to": "{fontDir}/material-icons.ttf"
    },
    {
      "from": "https://fonts.googleapis.com/icon?family=Material+Icons" ,
      "to": "{localDir}/material-icons.css",
      "replacements": [
        {
          "from": "{materialIconFontUrl}",
          "to": "{fontDir}/material-icons"
        }
      ]
    },
    {
      "from": "https://fonts.googleapis.com/css?family=Open+Sans:300,400,700",
      "to": "{localDir}/open-sans.css",
      "replacements": [
        {
          "from": "https://fonts.gstatic.com/s/opensans/v34/",
          "to": "{fontDir}/"
        }
      ]
    },
    {
      "from": "https://fonts.gstatic.com/s/opensans/v34/{openSansFonts}",
      "to": "{fontDir}",
      "replacements": [
        {
          "from": "{materialIconFontUrl}",
          "to": "{fontDir}/material-icons"
        }
      ]
    }
  ]
}
```
### If you like this tool, please star it on [Github](https://github.com/fgilde/remote-dependencies)  and share it with your friends
If not, you can give a star anyway and let me know what I can improve to make it better for you.


## Links
[Github Repository](https://github.com/fgilde/remote-dependencies) | 
[NPM Package](https://www.npmjs.com/package/@fgilde/remote-dependencies)
#
