'use strict';

var denodeify = require('denodeify');
var exec = denodeify(require('child_process').exec, function(err, stdout, stderr) {
	if (err) {
		console.log(stdout);
		console.log(stderr);
	}
	return [err];
});

module.exports = function() {
	return exec('origami-build-tools build --js=./client/main.js --sass=./client/main.scss --buildCss=main.css --buildJs=main.js --buildFolder=./public/');
};
