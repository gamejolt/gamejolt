var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var plugins = require( 'gulp-load-plugins' )();
var sequence = require( 'run-sequence' );
var fs = require( 'fs' );

module.exports = function( config )
{
	/**
	 * Configures the build process for the app.
	 * Should be called before anything else to set up the environment.
	 */
	gulp.task( 'app:config', function()
	{
		config.noInject = true;  // Don't revision filenames.

		if ( config.production ) {
			config.appBuildDir = 'build/app/prod';
		}
		else {
			config.appBuildDir = 'build/app/dev';
		}

		config.buildDir = config.appBuildDir + '/www';

		return gulp.src( [ './config.xml' ] )
			.pipe( gulp.dest( config.appBuildDir ) );
	} );

	/**
	 * Does any manual modifications needed after the default build process is complete.
	 */
	var modifySections = config.sections.map( function( section )
	{
		if ( section == 'app' ) {
			section = 'index';
		}

		gulp.task( 'app:modify:' + section, function()
		{
			// Base tag for index.html is different.
			// App uses fallback mode for location since it's not served through a server.
			return gulp.src( config.buildDir + '/' + section + '.html' )
				.pipe( plugins.replace( '<base href="/">', '<base href="/' + section + '.html">' ) )
				.pipe( gulp.dest( config.buildDir ) );
		} );

		return 'app:modify:' + section;
	} );

	gulp.task( 'app:modify', modifySections );

	/**
	 * This will actual start the app build process.
	 */
	gulp.task( 'app', function( callback )
	{
		return sequence(
			'app:config',
			'default',
			'app:modify',
			callback
		);
	} );
};
