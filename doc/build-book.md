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