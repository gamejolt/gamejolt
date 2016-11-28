var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var fs = require( 'fs' );

module.exports = function( config )
{
	gulp.task( 'terms', function()
	{
		return gulp.src( 'src/lib/terms/**/*.md' )
			.pipe( plugins.markdown() )
			.pipe( gulp.dest( config.buildDir + '/terms' ) );
	} );
};
