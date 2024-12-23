Build Book
==========

## Build
- Install node.
- Install npm.
- Clone yodertv/Reminders from Github.
- Resolve dependancies by ```npm install```.
- Check client-side dependancies.
- Make the deployment you want.
- Run with any node environment or deploy to vercel.
- Enjoy.

## Build and deploy

Build
```
npm install
npm run build <build environment>
```

Each Vercel deployment get's it's own unique URL. This project needs to know its own application URL and so do the google API's for authentication. So we use the Vercel.com Domain settings tab command to point a common name to the unique instance.

In the browser try out [Reminders App](https://reminders-ashen.vercel.app).

## Add a new target
- choose a new {name}.
- change make.js and add the new target {name}.
- create a build_props.{name}.json file by coping an existing one.
- check environment variables and put into .env.{name}.

```
/**
* Setting up new environments:
* 1) Copy existing build_props.<environment name>.json file and change the <environment name> to the new environment.
* 2) Add <environment name> to the validEnvs array in make.js.
* 3) Edit the values as needed in the new build file,
* 4) Create new install commmands as required.
*
*  To add new src files - Edit the SRC_FILE array.
*/
```

## Change client side libraries
- Test by changing the build_props to use the CDN directly e.g.

```
"angularRoot" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/",
```

- Once it looks like it works use npm to download new versions and install locally. E.g. angular

```
% npm install angular@1.5.8
% cp -p node_modules/angular/angular.min.js lib/js
```

## Todo: Creating a published version for yodertv/Reminders. 

Use get pull local to get the working master branch from my local repo and merge it into Reminders than push to origin.

Assumes that Todos is the name of the project and Reminders is the name of the published version and they are peers in the same directory.

## Deprecated: Deploy to modulus / xervo. 

From Nodejitsu to moduls to Xervo, went out of business 4/28/2017
...to Ziet rebranded as Vercel.

## Deprecated -- Build for modulus:
```
% ./make.js --silent install localhost
```	

Create a project on mondulus
```
% modulus project create
```

From the build directory deploy by
```
% modulus deploy -p "Todos"
```
