
'use strict';

var gulp = require('gulp');
require('gulp-watch');

var obt = require('origami-build-tools');
var build = require('haikro/lib/build');
var about = require('../lib/about');

var mainJsFile = 'main.js';
var workerJsFile = 'worker.js';
var mainScssFile = 'main.scss';
var sourceFolder = './client/';
var buildFolder = './public/';
var isDev = false;
const hashAssets = require('../lib/hash-assets');

// comma separated globs
const watchFiles = {
	js: './client/**/*.js',
	sass: './client/**/*.scss'
}

const capitalise = string => string[0].toUpperCase() + string.slice(1);

function getAssetType(task) {
	switch(task) {
		case 'build-sass':
			return 'sass';
		case 'build-js':
		case 'build-worker':
		case 'build-minify-js':
			return 'js';
	}
}

function run(tasks, opts) {

	if (tasks.length === 0) {
		return Promise.resolve();
	}
	return new Promise(function(resolve, reject) {
		if (opts.watch) {
			tasks.forEach(task => {
				const watchFiles = opts[`watchFiles${capitalise(getAssetType(task))}`];
				console.log(`Watching ${watchFiles} and will trigger ${task}`);
				gulp.watch(watchFiles.split(','), [task]);
			});
		} else {
			console.log(`Starting to run ${tasks.join(', ')}`);
			gulp.start(tasks, resolve)
				.on('error', reject);
		}
	});
}

gulp.task('build-sass', function() {
	return obt.build.sass(gulp, {
			sass: sourceFolder + mainScssFile,
			buildFolder: buildFolder,
			env: isDev ? 'development' : 'production',
			sourcemaps: true
		})
		.on('end', function() {
			console.log('build-sass completed');
		})
		.on('error', function(err) {
			console.warn('build-sass errored');
			throw err;
		});
});

function buildJs(jsFile) {
	return obt.build.js(gulp, {
		js: sourceFolder + jsFile,
		buildFolder: buildFolder,
		buildJs: jsFile,
		env: isDev ? 'development' : 'production',
		sourcemaps: true
	})
	.on('end', function() {
		console.log('build-js completed for ' + jsFile);
	})
	.on('error', function(err) {
		console.warn('build-js errored for ' + jsFile);
		throw err;
	});
}

gulp.task('build-js', function() {
	return buildJs(mainJsFile);
});

gulp.task('build-worker', function() {
	return buildJs(workerJsFile);
});


function task (opts) {
	isDev = opts.isDev;
	let tasks = [];
	if (!opts.skipSass) {
		tasks.push('build-sass');
	}
	if (!opts.skipJs) {
		tasks.push('build-js');
	}
	if (opts.worker) {
		tasks.push('build-worker');
	}
	return Promise.all([
			run(tasks, opts),
			about()
		])
		.then(() => {
			if (!opts.isDev) {
				return hashAssets();
			}
		})
		.then(() => {
			if (!opts.isDev) {
				console.log("Building the Heroku tarball");
				return build({ project: process.cwd() });
			}
		});
};

module.exports = function (program, utils) {
	program
		.command('build')
		.option('--dev', 'Skip minification')
		.option('--watch', 'Watches files')
		.option('--watch-files-js <globs>', `Comma separated globs of js files to watch [${watchFiles.js}]`, watchFiles.js)
		.option('--watch-files-sass <globs>', `Comma separated globs of sass files to watch [${watchFiles.sass}]`, watchFiles.sass)
		.option('--skip-js', 'skips compilation of JavaScript')
		.option('--skip-sass', 'skips compilation of Sass')
		.option('--worker', 'additionally builds Service Worker JavaScript')
		.description('build javascript and css')
		.action(function(options) {
			task({
				isDev: options.dev,
				watch: options.watch,
				watchFilesJs: options.watchFilesJs,
				watchFilesSass: options.watchFilesSass,
				skipJs: options.skipJs,
				skipSass: options.skipSass,
				worker: options.worker
			}).catch(utils.exit);
		});
};

module.exports.task = task;
