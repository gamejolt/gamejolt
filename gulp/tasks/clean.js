const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

module.exports = config => {
	gulp.task('clean', () => {
		return gulp
			.src(config.buildDir, { read: false, allowEmpty: true })
			.pipe(plugins.clean({ force: true }));
	});
};
