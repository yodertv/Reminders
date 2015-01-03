#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
// shelljs is great! use it!
var _shell = require('shelljs');
// var _fs = require('fs');
var _pkg = require('./package.json');

/**
* Module global variables
*
*/

var DIST_PATH = 'awsum.js';
var _props = undefined;
var _validCmd = false;
var _env = undefined;

/**
* Setting up new environments:
* 1) Copy existing build_props.<environment name>.json file and change the <environment name> to the new environment.
* 2) Add <environment name> to the validEnvs array below.
* 3) Edit the values as needed,
* 4) Create new install commmands as required.
*/

var validEnvs = ['localnet','localhost','jitsu'];

// Global options
program
  .version('0.0.3')
  .description('A program to build and deploy.') // Not sure why this doesn't show in the help output.
  .option('--silent', 'suppress log messages');

// In this version commands are install -> build -> bake -> clean. Arrow shows dependancy.

program
    .command('clean')
    .description(' Clean (purge) all make produced files')
    .action(clean);

program
    .command('bake [env]')
    .description(' Clean then Bake all source files for environment [env=localhost]')
    .action(bake);

program
    .command('build [env]')
    .description(' Bake then Build distribution files for environment [env=localhost]')
    .action(build);

program
    .command('install [env]')
    .description(' Build then Install distribution to environment [env=localhost]')
    .action(install);

// must be before .parse() since
// node's emit() is immediate
program.on('--help', function(){
	console.log('  Examples:');
	console.log('');
	console.log('    $ %s --help', program.name());
	console.log('    $ %s --silent build jitsu', program.name());
	console.log('    $ %s install localnet', program.name());
	console.log('    $ %s clean', program.name());
	console.log('');
	console.log('  Valid Environments:');
	console.log('');
	console.log('   ', validEnvs);
	console.log('');
});

// console.log(process.argv.length);

program.parse(process.argv);
// console.log(program.args.length);
// console.log(program.args);

// if (program.args.length != 2) { program.help() }; // exit with help message if there are unexpected args.
// if (process.argv.length <= 2) { program.help() }; // exit with help message if no arguments are presented.
// if (process.argv.length >= 5) { program.help() }; // exit with help message if too many arguments are presented.

// Globally executed (except with --help and --version options)
if (!_validCmd) { program.help() };

// Command definitions
// commands are install -> build -> bake -> clean. Arrow shows dependancy.

function initEnv(env){
	if (!_props) {
		_validCmd = true;
		_env = env || 'localhost';
		if (validEnvs.indexOf(_env) == -1) { // No such environment
			console.log('\n  No such environment, %s.', _env);
			program.help();
		}; 
		var prop_file_name = "./build_props." + _env + ".json";
		_props = require(prop_file_name);
		console.log(' Target environment=%s.', _env);	
	    console.log(' Using package:');
	    console.log(_pkg);
	    console.log(' Using properties:');
	    console.log(_props);
	}
}

function clean(){
	_validCmd = true;
    _shell.rm(DIST_PATH);
    if (! program.silent) {
        console.log(' Cleaned output files!');
    }
}
function bake(env){
	initEnv(env);
    clean();
    if (! program.silent) {
        console.log(' Baking %s output files!', _env);
    }
    // use sed to perform global replace 
}

function build(env){
	initEnv(env);
	bake(_env);

    // concat files here or do anything that generates the dist files

	if (! program.silent) {
        console.log(' Building %s!', _env);
    }
	
	_shell.cp('make.js', DIST_PATH); // My build

	var err = _shell.error();

	if (!err===null) { console.log(err) }

}

function install(env) {
	initEnv(env);
	build(_env);
    if (! program.silent) {
        console.log(' Installing %s!', _env);
    }
}

/*
* Original ant config. Remaining functions to implement.
<project name="todos" default="localhost, build">

	<!-- Usage: ant localhost build -->

	<property name="build.dir" value="../build" />
	<property name="lib.dir" value="../lib" />
	<property name="src.dir" value="." />
	<property name="static.dir" value="${build.dir}/static" />

	<target name="localhost">
		<loadproperties srcfile="build.properties.localhost" />
	</target>

	<target name="jitsu">
		<loadproperties srcfile="build.properties.jitsu" />
	</target>

	<target name="build" depends="clean,prep,install,bake">
		<echo>Built ${name} version ${version}!</echo>
	</target>

	<target name="clean">
		<echo>Cleaning ${name} version ${version}! ${build.dir}</echo>
		<delete dir="${build.dir}"/>
	</target>

	<target name="prep" depends="clean">
		<echo>Preping ${name} build dir ${build.dir}</echo>
		<mkdir dir="${build.dir}"/>
	</target>

	<target name="install" depends="prep">
		<echo>Installing ${name} build dir ${build.dir}</echo>
		<copy todir="${build.dir}">
			<fileset dir="${src.dir}" includes="
				package.json,
				userlist.js,
				todoServer.js">
			</fileset>
		</copy>
		<copy todir="${static.dir}">
			<fileset dir="${src.dir}" includes="
				*.html,
				TodoServices.js,
				todo.js">
			</fileset>
		</copy>
		<copy todir="${static.dir}">
			<fileset dir="${lib.dir}" includes="
				img/*.png,
				img/favicon.ico">
			</fileset>
		</copy>
		<copy todir="${static.dir}">
			<fileset dir="${lib.dir}" includes="
				js/angular.min.js,
				js/angular-resource.min.js,
    			js/jquery-2.0.0.min.js,
    			js/bootstrap.min.js,
    			js/ui-bootstrap-tpls-0.3.0.min.js,
    			css/bootstrap.min.css,
    			css/bootstrap-responsive.min.css">
    		</fileset>
		</copy>
		<copy todir="${static.dir}/css">
			<filelist dir="${src.dir}" files="todo.css"></filelist>
		</copy>
	</target>

	<target name="bake" depends="install">
		<echo>Baking ${name} build dir ${build.dir}, $(nodeURL}, ${logDate}.</echo>
		<replaceregexp match="@VERSION@" replace="${version}" flags="g" byline="true">
			<filelist dir="${build.dir}" files="package.json,${static.dir}/welcome.html,
				${static.dir}/index.html"></filelist>
		</replaceregexp>
		<replaceregexp match="@NODEURL@" replace="${nodeURL}" flags="g" byline="true">
			<filelist dir="${build.dir}" files="${static.dir}/TodoServices.js,
				todoServer.js"></filelist>
		</replaceregexp>
		<replaceregexp match="@LOGDATE@" replace="${logDate}" flags="g" byline="true">
			<filelist dir="${build.dir}" files="todoServer.js"></filelist>
		</replaceregexp>
	</target>
</project>
*/
