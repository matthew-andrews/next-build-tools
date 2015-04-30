'use strict';

var spawn = require('child_process').spawn;
var packageJson = require(process.cwd() + '/package.json');
var normalizeName = require('../lib/normalize-name');

function toStdOut(data) {
	process.stdout.write(data.toString());
}

function toStdErr(data) {
	process.stderr.write(data.toString());
}

function runLocal(resolve, reject) {
	var env = Object.create(process.env);
	var local = spawn('nodemon', ['server/app', '--watch server'], { cwd: process.cwd(), env: env });

	local.stdout.on('data', toStdOut);
	local.stderr.on('data', toStdErr);
	local.on('error', reject);
	local.on('close', resolve);
}

function runRouter(resolve, reject) {
	var env = Object.create(process.env);
	env.DEBUG = 'proxy';
	env.PORT = 5050;
	env[normalizeName(packageJson.name, { version: false })] = 3002;
	var router = spawn('next-router', { env: env });

	router.stdout.on('data', toStdOut);
	router.stderr.on('data', toStdErr);
	router.on('error', reject);
	router.on('close', resolve);
}

module.exports = function(opts) {
	return Promise.all([ new Promise(runLocal), new Promise(runRouter) ]);
};
