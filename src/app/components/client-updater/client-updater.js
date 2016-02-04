/**
 * Can't be in angular-land since we need to make sure it can update even if we push a broken client out.
 */
(function()
{
	var Updater = require( 'nwjs-snappy-updater' ).Updater;
	var path = require( 'path' );

	var CHECK_ENDPOINT = 'http://d.gamejolt.net/data/client/manifest.json';
	var CHECK_INTERVAL = 15 * 60 * 1000; // 15min currently

	function Client_Updater()
	{
		var _this = this;

		this.check();
		window.setInterval( function()
		{
			_this.check();
		}, CHECK_INTERVAL );
	}

	Client_Updater.prototype.check = function()
	{
		console.log( 'Checking for client update.' );

		var os = require( 'os' );
		var packageJson;

		// Mac exec path looks like:
		// root/blah.app/Contents/Frameworks/nwjs Helper.app/Contents/MacOS/nwjs
		// The other OSes are just the root dir.
		var cwd = path.dirname( process.execPath );
		if ( os.type() == 'Darwin' ) {
			cwd = path.resolve( cwd, '../../../../Resources' )
			packageJson = require( path.join( cwd, 'app.nw', 'package.json' ) );
		}
		else {
			packageJson = require( path.join( cwd, 'package.json' ) );
		}

		if ( packageJson['no-auto-update'] === true ) {
			console.log( 'Skip update. Package says not to auto-update.' );
			return;
		}

		var updater = new Updater( packageJson.version, CHECK_ENDPOINT, {
			cwd: cwd,
		} );

		return updater.check()
			.then( function( hasNew )
			{
				if ( !hasNew ) {
					console.log( 'Client is up to date.' );
					return;
				}

				console.log( 'New version of client. Updating...' );

				return updater.update()
					.then( function()
					{
						console.log( 'Updated! Reloading...' );
						var gui = require( 'nw.gui' );
						var win = gui.Window.get();
						win.reloadDev();
					} );
			} )
			.catch( function( err )
			{
				console.log( err );
			} );
	};

	var clientUpdater = new Client_Updater();
})();
