# build-book.md

To add a new target:
- choose a new {name}.
- change make.js and add the new target {name}.
- create a build_props.{name}.json file by coping an existing one.

/**
* Setting up new environments:
* 1) Copy existing build_props.<environment name>.json file and change the <environment name> to the new environment.
* 2) Add <environment name> to the validEnvs array in make.js.
* 3) Edit the values as needed in the new build file,
* 4) Create new install commmands as required.
*
*  To add new src files - Edit the SRC_FILE array.
*/

Changing client side libraries:
- Test by changing the build_props to use the CDN directly e.g.

"angularRoot" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/",

- Once it looks like it works use npm to download new versions and install locally. E.g. angular

```
% npm install angular@1.5.8
% cp -p node_modules/angular/angular.min.js lib/js
```