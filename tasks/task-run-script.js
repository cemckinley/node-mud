/**
 * RUNSCRIPT GRUNT TASK
 * @description  grunt task to run node script as child process. Kills & restarts script if it's already running.
 */

module.exports = function(grunt) {
	var sys = require('sys'),
		execSync = require('exec-sync'),
		processes = {};

	function runScript(filepath){

		killProcessIfRunning(filepath);

		grunt.log.writeln('Running script: ' + filepath);
		processes[filepath] = grunt.util.spawn({
			cmd: 'node',
			args: [filepath]
		}, function(error, result, code){
			if(result.stderr){
				grunt.log.writeln('Error: ' + result.stderr);
			}

		});
	}

	function killProcessIfRunning(filepath){
		/*var cmd = "ps aux | grep '[n]ode " + filepath + "' | awk '{print $2}'",
			pid = execSync(cmd);

		if(pid && pid !== ''){
			grunt.log.writeln('Script already running: ' + pid + ' ' + filepath + ', killing script first');
			execSync('kill ' + pid);
		}*/

		if(processes[filepath]){
			grunt.log.writeln('Script already running: ' + filepath + ', killing script first');
			processes[filepath].kill();
		}
	}

	grunt.registerMultiTask('runscripts', 'Run node scripts in the background', function() {
		this.filesSrc.forEach(runScript);
	});

};