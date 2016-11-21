var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var fs = require( 'fs' );

module.exports = function( config )
{
	gulp.task( 'game-api-doc:nav', function()
	{
		return gulp.src( 'src/lib/doc-game-api/v1.x/nav.json' )
			.pipe( gulp.dest( config.buildDir + '/doc-game-api' ) );
	} );

	gulp.task( 'game-api-doc:compile', function()
	{
		return gulp.src( 'src/lib/doc-game-api/v1.x/**/*.md' )
			.pipe( plugins.markdown() )
			.pipe( plugins.replace( '/index.md', '' ) )
			.pipe( plugins.replace( '.md', '' ) )
			.pipe( plugins.replace( /href="([^"]*)"/g, 'href="/game-api/doc$1"' ) )
			.pipe( gulp.dest( config.buildDir + '/doc-game-api' ) );
	} );
};
