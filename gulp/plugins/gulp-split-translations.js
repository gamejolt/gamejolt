var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var fs = require('fs');
var pofile = require('pofile');
var _ = require('lodash');

const PLUGIN_NAME = 'gulp-split-translations.js';

module.exports = function(sections) {
	// Creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, callback) {
		if (file.isBuffer()) {
			// If we aren't splitting out sections, just pass through.
			if (!Object.keys(sections).length) {
				this.push(file);
				return callback();
			}

			var content = file.contents.toString();
			var parsed = JSON.parse(content);
			var lang = Object.keys(parsed)[0];

			var poContent = fs.readFileSync(
				path.resolve(
					__dirname,
					'../../../site-translations/' + lang + '/main.po'
				),
				'utf8'
			);
			var poParsed = pofile.parse(poContent);
			var poItems = _.indexBy(poParsed.items, 'msgid');

			_.forEach(
				sections,
				function(sectionPaths, sectionName) {
					var sectionReferenceRegex = new RegExp(
						'^(' + sectionPaths.join('|') + ')'
					);
					var sectionJson = {};
					sectionJson[lang] = {};

					// For each translation term in this language.
					for (var i in parsed[lang]) {
						var poItem = poItems[i];
						if (poItem) {
							var matchingReferences = 0;
							for (var j in poItem.references) {
								if (poItem.references[j].match(sectionReferenceRegex)) {
									++matchingReferences;
								}
							}

							// We only pull it into the section if ALL the references belong to the section.
							// Otherwise we want to put it as part of the "common" translation file.
							if (matchingReferences == poItem.references.length) {
								sectionJson[lang][i] = parsed[lang][i];
								delete parsed[lang][i];
							}
						}
					}

					this.push(
						new gutil.File({
							cwd: file.cwd,
							base: file.base,
							path: path.join(path.dirname(file.path), sectionName + '.json'),
							contents: new Buffer(JSON.stringify(sectionJson), 'utf-8'),
						})
					);
				},
				this
			);

			file.contents = new Buffer(JSON.stringify(parsed), 'utf-8');
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
