const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

module.exports = config => {
	gulp.task('clean:main', () => {
		return gulp
			.src(config.buildDir, { read: false, allowEmpty: true })
			.pipe(plugins.clean({ force: true }));
	});

	gulp.task('clean:client', cb => {
		if (config.clientBuildDir) {
			return gulp
				.src(config.clientBuildDir, { read: false, allowEmpty: true })
				.pipe(plugins.clean({ force: true }));
		} else {
			cb();
		}
	});

	gulp.task('clean', gulp.parallel('clean:main', 'clean:client'));
};
