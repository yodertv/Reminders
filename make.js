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
var DIST_STATIC = DIST_PATH + _pkg.static_dir;
var API_PATH = DIST_PATH + _pkg.api_dir;
var SRC_PATH = _pkg.src_dir;
var LIB_PATH = _pkg.lib_dir;
var build_manifest_file = DIST_PATH + "build_manifest.txt";
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
* 5) Make .env.<environment name> file for run-time variables.
*
*  To add new src files - Edit the SRC_FILE array.
*/

// Names of valid environments with definition property files defined
var validEnvs = ['localnet','localhost', '127', 'vercel'];

// Client source and lib files to copy to static directory
var SRC_FILES_NAMES = ['TodoServices.js', 'todo.html', 'todo.js', 'list.html', 'index.html', 'todo.css', 'welcome.html'];

var SRC_FILES = [];
for (var i = 0; i < SRC_FILES_NAMES.length; i++) {
 	SRC_FILES.push(SRC_PATH + '/' + SRC_FILES_NAMES[i]);
}; 

// Client lib files to copy to static directory
var LIB_FILES_NAMES = ['js', 'css', 'img', 'fonts'];
var LIB_FILES = [];
for (var i = 0; i < LIB_FILES_NAMES.length; i++) {
 	LIB_FILES.push(LIB_PATH + '/' + LIB_FILES_NAMES[i]);
}; 

// Server source files to copy to root directory.
var SRV_FILES_NAMES = ['todoServer.js', 'user-list.js', 'logger.js', 'remindersSchema.js'];
var SRV_FILES = [];
for (var i = 0; i < SRV_FILES_NAMES.length; i++) {
 	SRV_FILES.push(SRC_PATH + '/' + SRV_FILES_NAMES[i]);
};

// Files into which to bake the @VERSION@
var VER_FILES = [
	DIST_STATIC + '/' + 'todo.js', 
	DIST_STATIC + '/' + 'TodoServices.js', 
	DIST_STATIC + '/' + 'index.html',
	DIST_STATIC + '/' + 'welcome.html',
	DIST_STATIC + '/' + 'list.html',
	API_PATH + '/' + 'todoServer.js'
];

// Files into which to bake the @NODEURL@
var URL_FILES = [DIST_STATIC + '/' + 'TodoServices.js', API_PATH + '/' + 'todoServer.js'];

// Files into which to bake the @APIPATH@
var API_FILES = [
	DIST_STATIC + '/' + 'TodoServices.js',
	API_PATH + '/' + 'todoServer.js'
];

// Files into which to bake the @ANGULARROOT@
var ANG_FILES = [DIST_STATIC + '/' + "index.html"];

_shell.config.fatal = false;

// Global options
program
  .version('0.0.5')
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
		_env = env || process.env.BUILD_ENV,
		_env = _env || 'localhost';

		if (validEnvs.indexOf(_env) == -1) { // No such environment
			console.log('\n  No such environment, %s.', _env);
			program.help();
		}; 

		var prop_file_name = "./build_props." + _env + ".json";
		_props = require(prop_file_name);

		var git_log = _shell.exec('git log --graph --oneline --decorate --all -n 10', {'silent':'true'});
		var git_status = _shell.exec('git status', {'silent':'true'});
		var git_repos = _shell.exec('git remote -v', {'silent':'true'});
		var build_date = new Date();

		build_manifest = '\n ' + program.name() + ' started with argv="' + process.argv + '"\n' +
							'\n ' + build_date.toString() + '\n' + 
							'\n Target environment=' + _env + '\n' +
							'\n Build platform=' + process.platform + '\n' +
							'\n Build host=' + _os.hostname() + '\n ' +
							'\n CWD=' + process.cwd() + '\n' +
	    					'\n Using package:' + '\n' +
	    					JSON.stringify(_pkg, null, " ") + '\n' +
	    					'\n Using properties:' + '\n' +
	    					JSON.stringify(_props, null, " ") + '\n' +
	    					'\n Using code:' + '\n' +
	    					git_log.output +
	    					'\n With status:' + '\n' +
	    					git_status.output +
	    					'\n With repos:' + '\n' +
	    					git_repos.output;

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
    _shell.rm('-rf', DIST_STATIC, API_PATH, build_manifest_file, ".env");
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
    
	if (! program.silent) {
    	console.log('\n Checking node-modules depenancies...');
    }
    var list_results = _shell.exec('npm ls', {'silent':'true'});// non-zero exit code
    if (list_results.code !== 0) {
		console.log('\n Sorry, there are missing dependancies reported by npm list.\n');
		console.log(' ', list_results.output);
		console.log(' Exit code:', list_results.code);
		program.help();
	}
    
    // Prepare the distribution directories
    _shell.mkdir('-p', DIST_STATIC);
	var err = _shell.error();
	if (!err===null) { console.log(err) }

    _shell.mkdir('-p', API_PATH);
	var err = _shell.error();
	if (!err===null) { console.log(err) }

    // Stamp it with the build manifest.
    build_manifest.to(build_manifest_file);

    // Install the dotenv file.
    _shell.cp("-f", ".env." + _env, DIST_PATH + ".env"); 
	var err = _shell.error();
	if (!err===null) { console.log(err) }

	// My Prep is to copy the distribution files to the API_PATH and DIST_STATIC.

    _shell.cp(SRC_FILES, DIST_STATIC); 
	var err = _shell.error();
	if (!err===null) { console.log(err) }

    _shell.cp('-R', LIB_FILES, DIST_STATIC); 
	var err = _shell.error();
	if (!err===null) { console.log(err) }

    _shell.cp(SRV_FILES, API_PATH);
	var err = _shell.error();
	if (!err===null) { console.log(err) }

    // Use sed to perform global replace in the build directory

	for (var i 	= VER_FILES.length - 1; i >= 0; i--) {
		_shell.sed('-i', /@VERSION@/g, _pkg.version, VER_FILES[i]);	
	};

	for (var i 	= URL_FILES.length - 1; i >= 0; i--) {
		_shell.sed('-i', /@NODEURL@/g, _props.nodeURL, URL_FILES[i]);	
	};

	for (var i 	= API_FILES.length - 1; i >= 0; i--) {
		_shell.sed('-i', /@APIPATH@/g, _props.apiPath, API_FILES[i]);	
	};

	for (var i 	= ANG_FILES.length - 1; i >= 0; i--) {
		_shell.sed('-i', /@ANGULARROOT@/g, _props.angularRoot, ANG_FILES[i]);	
	};

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
