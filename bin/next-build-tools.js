#!/usr/bin/env node
'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

var program = require('commander');
var deploy = require('../tasks/deploy');
var clean = require('../tasks/clean');
var configure = require('../tasks/configure');
var provision = require('../tasks/provision');
var verify = require('../tasks/verify');
var destroy = require('../tasks/destroy');
var purge = require('../tasks/purge');
var nightwatch = require('../tasks/nightwatch');
var downloadConfiguration = require('../tasks/download-configuration');
var deployHashedAssets = require('../tasks/deploy-hashed-assets');

function list(val) {
	return val.split(',');
}

function exit(err) {
	console.log(err);
	process.exit(1);
}

program.version(require('../package.json').version);

program
	.command('clean')
	.description('runs git clean -fxd')
	.action(function() {
		clean().catch(exit);
	});

	program
		.command('deploy [app]')
		.description('runs haikro deployment scripts with sensible defaults for Next projects')
		.action(function(app) {
			deploy(app).catch(exit);
		});

	program
		.command('configure [source] [target]')
		.description('downloads environment variables from next-config-vars and uploads them to the current app')
		.option('-o, --overrides <abc>', 'override these values', list)
		.action(function(source, target, options) {
			configure({ source: source, target: target, overrides: options.overrides }).catch(exit);
		});

	program
		.command('download-configuration <app>')
		.description('downloads environment variables from app from Heroku to make adding them to the next-config-vars service easier')
		.action(function(app) {
			if (app) {
				downloadConfiguration(app).catch(exit);
			} else {
				exit("Please provide an app name");
			}
		});

	program
		.command('provision [app]')
		.description('provisions a new instance of an application server')
		.action(function(app) {
			if (app) {
				provision(app).catch(exit);
			} else {
				exit("Please provide an app name");
			}
		});

	program
		.command('verify')
		.description('internally calls origami-build-tools verify with some Next specific configuration (use only for APPLICATIONS.  Front End components should continue to use origami-build-tools verify)')
		.action(function() {
			verify().catch(exit);
		});

	program
		.command('nightwatch [test]')
		.option('-c, --config <config>', 'The location of the nightwatch.json, defaults to Next Build Tools nightwatch.json')
		.option('-e, --env <env>', 'The location of the nightwatch.json, defaults to Next Build Tools defined environments')
		.description('runs nightwatch with some sensible defaults')
		.action(function(test, options) {
			nightwatch({
				test: test,
				env: options.env,
				config: options.config

			})
				.catch(exit);
		});

	program
		.command('deploy-hashed-assets')
		.description('deploys ./hashed-assets/ to <app-name> on GitHub')
		.action(function() {
			deployHashedAssets().catch(exit);
		});

	program
		.command('destroy [app]')
		.description('deletes the app from heroku')
		.action(function(app) {
			if (app) {
				destroy(app).catch(exit);
			} else {
				exit("Please provide an app name");
			}
		});

	program
		.command('purge [url')
		.option('-s, --soft <soft>', 'Perform a "Soft Purge (will invalidate the content rather than remove it"')
		.description('Purges the given url. Requires a FASTLY_KEY environment variable')
		.action(function(url, options){
			if(url){
				purge(url, options).catch(exit);
			}else{
				exit('Please provide a url');
			}
		});

	program
		.command('*')
		.description('')
		.action(function(app) {
			exit("The command ‘" + app + "’ is not known");
		});



program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
