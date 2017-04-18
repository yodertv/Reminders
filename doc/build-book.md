Build Book
==========

## Build
- Install node.
- Install npm.
- Clone yodertv/Reminders from Github.
- Resolve dependancies by ```npm update```.
- Make the deployment you want.
- Install the node deployment tools for the target hosting service
- Deploy and enjoy.

## Build and deploy to Zeit using now

Build for zeit:
```
% ./make.js --silent install zeit
```

Deploy your build to zeit using now
```
% cd build; now ; cd ..
> Deploying ~/src/Todos/build
> Warning! Requested node version 5.1.0 is not available 7.7.3
> Using Node.js 7.7.3 (default)
> Ready! https://reminders-kevovklwel.now.sh (copied to clipboard) [2s]
> You are on the OSS plan. Your code will be made public.
> Upload [====================] 100% 0.0s
> Sync complete (2.6kB) [7s] 
> Initializing…
> Building
> ▲ npm install
>  ‣ passport@0.2.1
>  ‣ passport-local@1.0.0
>  ‣ passport-google-oauth@0.1.5
>  ‣ mongojs@2.4.0
>  ‣ bootstrap@3.3.6
>  ‣ angular@1.5.8
>  ‣ angular-resource@1.5.8
>  ‣ angular-route@1.5.8
>  ‣ cookie-session@1.2.0
> ✓ Installed 59 modules [3s]
> ▲ npm start
> > Reminders@0.5.5 start /home/nowuser/src
> > node ./todoServer.js
> the options [authMechanism] is not supported
> Todo Server v0.5.5
> Running on hsevx4wagfbjhjvg1g5sde5h:80
> Node environment = PROD
> User store = ds043972.mongolab.com:43972/users[userList]
> Use https://reminders.now.sh
> CTRL + C to shutdown
> Deployment complete!
```

Each now deployment get's it's own unique URL. This project needs to know its own application URL and so do the google API's for authentication. So we use the ```now alias``` command to point a common name to the unique instance.

```
% now alias set https://reminders-kevovklwel.now.sh reminders
```

In the browser try out [Reminders App](https://reminders.now.sh).

## Add a new target
- choose a new {name}.
- change make.js and add the new target {name}.
- create a build_props.{name}.json file by coping an existing one.

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

## Creating a published version for yodertv/Reminders. 

Assumes that Todos is the name of the project and Reminders is the name of the published version and they are peers in the same directory.

```
cd ~/src/Reminders
cp -pR ../Todos/src .
cp -pR ../Todos/doc .
cp -p ../Todos/* .
cp -p ../Todos/lib/img/RemindersApp.png ./lib/img
```
## Deprecated: Deploy to modulus / xervo. 

From Nodejitsu to moduls to Xervo. Went out of business 4/28/2017

Build for modulus:
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
