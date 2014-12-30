#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var DIST_PATH = 'awsum.js';
// shelljs is great! use it!
var shell = require('shelljs');
var _fs = require('fs');

// Global options
program
  .version('0.0.1')
  .option('--silent', 'suppress log messages.');


// commands
program
    .command('deploy')
    .description('Optimize site for deploy.')
    .action(deploy);

program
    .command('purge')
    .description('Delete old files from dist folder.')
    .action(purgeDeploy);

// must be before .parse() since
// node's emit() is immediate
program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ custom-help --help');
  console.log('    $ custom-help -h');
  console.log('');
});

program.parse(process.argv);

function deploy() {
    purgeDeploy();
    build();
}

function purgeDeploy(){
    _fs.unlinkSync(DIST_PATH);
    if (! program.silent) {
        console.log(' Deleted deploy files!');
    }
}

function build(){
    // concat files here or do anything that generates the dist files
	
    console.log(' In Build!');
	shell.cp('build.js', DIST_PATH);
	var err = shell.error();
	if (!err===null) { console.log(err) }

//    _fs.linkSync(DIST_PATH, 'Test file', function (err) {
 //	 	if (err) { console.log(err); throw err};
  //		console.log('It\'s saved!');
	//});
    if (! program.silent) {
        console.log(' Built!');
    }
}

// Globally executed (except with --help option)
console.log('stuff');

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
