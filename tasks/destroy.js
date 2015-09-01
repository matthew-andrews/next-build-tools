"use strict";

var spawn = require('shellpromise');

module.exports = function(options) {
	var app = options.app;
	var verbose = options.verbose;
	var promise = Promise.resolve();
	if (verbose) {
		promise = promise.then(function() {

				// `|| echo` to stop this failing failing builds
				return spawn('heroku logs -a ' + app + ' || echo', { verbose: true });
			});
	}
	promise = promise.then(function() {
			return spawn('heroku destroy -a ' + app + ' --confirm ' + app, { verbose: true });
		});
	return promise;
};
