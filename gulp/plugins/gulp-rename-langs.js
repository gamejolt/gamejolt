var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-rename-langs.js';

module.exports = function(options) {
	// Creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, callback) {
		if (file.isBuffer()) {
			var content = file.contents.toString();
			var parsed = JSON.parse(content);
			var keys = Object.keys(parsed);
			var lang = keys[0];

			// Changes en-us to en_US.
			var pieces = lang.split(/\-/);
			if (pieces.length > 1) {
				lang = pieces[0] + '_' + pieces[1].toUpperCase();
				parsed[lang] = parsed[keys[0]];
				delete parsed[keys[0]];
				file.contents = new Buffer(JSON.stringify(parsed), 'utf-8');
			}
		} else if (file.isStream()) {
			// Streams not supported.
			this.emit(
				'error',
				new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported.')
			);
			return callback();
		}

		// Anything else just falls through.
		this.push(file);
		return callback();
	});

	// returning the file stream
	return stream;
};
