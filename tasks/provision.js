
var util   = require('util');
var debug  = require('debug')('next-build-tools');
var packageJson = require(process.cwd() + '/package.json');
var denodeify = require('denodeify');
var exec = denodeify(require('child_process').exec, function(err, stdout, stderr) { return [err, stdout]; });
var create = require('haikro/lib/create');
var logger = require('haikro/lib/logger');

function normalizeName(name) {
	var matches = name.match(/^(?:ft-)?(?:next-)?(.*)/);
	if (matches) {
		return matches[1];
	}
	return name;
}

// create a Heroku application server
module.exports = function () {

    var build = process.env.CI_BUILD_NUMBER;
    var heroku_auth = process.env.HEROKU_AUTH_TOKEN;

    if (!build || !heroku_auth) {
        throw "You need to set HEROKU_AUTH_TOKEN and CI_BUILD_NUMBER environment variables";
    }

	var token;
	return Promise.all([
		process.env.HEROKU_AUTH_TOKEN ? Promise.resolve(process.env.HEROKU_AUTH_TOKEN) : exec('heroku auth:token'),
	])
		.then(function(results) {
	        logger.setLevel('debug');
			token = results[0].trim();
			var project = 'ft-next-' + normalizeName(packageJson.name);
            var server = {
                app: util.format('%s-%s', project, build),
                region: 'eu',
				token: token,
                organization: 'financial-times'
            };
            return create(server);
		});
};