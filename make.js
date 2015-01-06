#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
// shelljs is great! use it!
var _shell = require('shelljs');
var _os = require('os');
// var _fs = require('fs');
var _pkg = require('./package.json');

/**
* Module global variables
*
*/

var DIST_PATH = _pkg.build_dir;
var SRC_PATH = _pkg.src_dir;
var build_manifest = "";
var _props = undefined;
var _validCmd = false;
var _env = undefined;

/**
* Setting up new environments:
* 1) Copy existing build_props.<environment name>.json file and change the <environment name> to the new environment.
* 2) Add <environment name> to the validEnvs array below.
* 3) Edit the values as needed in the new build file,
* 4) Create new install commmands as required.
*
*  To add new src files - Edit the SRC_FILE array.
*/

var validEnvs = ['localnet','localhost','jitsu'];
var SRC_FILES = ['mongolab.js', 'favicon.ico', 'package.json', 'todo.css', 
					'todo.html', 'todo.js', 'todoServer.js', 'history.html',
					'list.html', 'index.html'];

//_shell.config.fatal = true;

// Global options
program
  .version('0.0.3')
  .description('A program to build and deploy.') // Not sure why this doesn't show in the help output.
  .option('--silent', 'suppress log messages');

// In this version commands are install -> build -> prep -> clean. Arrow shows dependancy.

program
    .command('clean')
    .description(' Clean (purge) all make produced files')
    .action(clean);

program
    .command('prep [env]')
    .description(' Clean then Prep all source files and dependancies for environment [env=localhost]')
    .action(prep);

program
    .command('build [env]')
    .description(' Prep then Build distribution files for environment [env=localhost]')
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
// commands are install -> build -> prep -> clean. Arrow shows dependancy.

function initEnv(env){
	if (!_props) { // Only initialize once.

		_validCmd = true;
		_env = env || 'localhost';

		if (validEnvs.indexOf(_env) == -1) { // No such environment
			console.log('\n  No such environment, %s.', _env);
			program.help();
		}; 

		var prop_file_name = "./build_props." + _env + ".json";
		_props = require(prop_file_name);

		var build_date = new Date();

		build_manifest = '\n ' + program.name() + ' started with argv="' + process.argv + '"\n' +
							'\n ' + build_date.toString() + '\n' +  // Includes time.
							// build_date.toTimeString() + '\n' +
							'\n Target environment=' + _env + '\n' +
							'\n Build platform=' + process.platform + '\n' +
							'\n Build host=' + _os.hostname() + '\n ' +
							'\n CWD=' + process.cwd() + '\n' +
	    					'\n Using package:' + '\n' +
	    					JSON.stringify(_pkg, null, " ") + '\n' +
	    					'\n Using properties:' + '\n' +
	    					JSON.stringify(_props, null, " ") +
	    					'\n Using process environment:' + '\n' +
	    					JSON.stringify(process.env, null, " ");

	    if (! program.silent) {
 	       console.log(build_manifest);
    	}
	}
}

function clean(){
    if (! program.silent) {
        console.log('\n Cleaning output files...');
    }
	_validCmd = true; 				// No initEnv here because environment is irrelevent to cleaning.
    _shell.rm('-rf', DIST_PATH);
}


function prep(env){
	initEnv(env);
    clean();
    if (! program.silent) {
        console.log('\n Preping %s output files...', _env);
    }
    
    // Check executable dependancies
    if (!_shell.which('npm')) {
 		console.log('\n Sorry, this script requires npm.\n');
 		program.help();
 	} 
    
    // Check node-module depenancies
    var list_results = _shell.exec('npm list', {'silent':'true'});// non-zero exit code
    if (list_results.code !== 0) {
		console.log('\n Sorry, there are missing dependancies reported by npm list.\n');
		console.log(' ', list_results.output);
		console.log(' Exit code:', list_results.code);
		program.help();
	}

    // Prepare the distribution directory
    _shell.mkdir(DIST_PATH);

    // Stamp it with the build manifest.
    var build_manifest_file = DIST_PATH + '/' + "build_manifest.txt";
    build_manifest.to(build_manifest_file);

    _shell.cp(SRC_FILES, DIST_PATH); // My Prep is to copy the distribution files to the DIST_PATH.

	// var err = _shell.error();

	// if (!err===null) { console.log(err) }

    // use sed to perform global replace
}

function build(env){

	initEnv(env);
	prep(_env);

	if (! program.silent) {
        console.log('\n Building %s...', _env);
    }
	
    // concat and minify files here or do anything that modifies the prep'd dist files for the target environment.

}

function install(env) {
	initEnv(env);
	build(_env);
    if (! program.silent) {
        console.log('\n Installing %s...', _env);
    }
	// Execute the steps to depoy the distribution to the selected run-time environment.
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
