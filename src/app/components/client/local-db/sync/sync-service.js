angular.module( 'App.Client.LocalDb' )
.run( function( LocalDb_Sync )
{
	LocalDb_Sync.init();
} )
.service( 'LocalDb_Sync', function( $q, $interval, Api, Device, LocalDb, LocalDb_Game, LocalDb_Package )
{
	var _this = this;

	var CHECK_INTERVAL = 60 * 60 * 1000; // 1hr currently
	// var CHECK_INTERVAL = 5 * 1000;

	this.init = function()
	{
		// Do an initial check on load of client and then set an interval to check periodically.
		this.check();
		$interval( function(){ _this.check() }, CHECK_INTERVAL );
	};

	this.check = function()
	{
		// We will pull our full library and try to see if any of them need to be updated.
		$q.all( [ LocalDb_Game.fetch(), LocalDb_Package.fetch() ] )
			.then( function( data )
			{
				var games = data[0];
				var packages = data[1];
				var builds = packages.map( function( localPackage )
				{
					return localPackage.build;
				} );

				var os = Device.os();
				var arch = Device.arch();


				var request = {
					games: {},
					builds: {},
					os: os,
					arch: arch,
				};

				// The modified_on fields are what tells us if the client has up to date info
				// for each model.
				games.forEach( function( game )
				{
					request.games[ game.id ] = game.modified_on || 0;
				} );

				builds.forEach( function( build )
				{
					request.builds[ build.id ] = build.modified_on || 0;
				} );

				return Api.sendRequest( '/web/client/sync', request, {
					detach: true,

					// If we allowed it to sanitize, it would filter out arrays in the request.
					sanitizeComplexData: false,
				} );
			} )
			.then( function( response )
			{
				// Don't do anything if we don't have anything to update.
				if ( response
					&& (
						(response.builds && response.builds.length)
						|| (response.games && response.games.length)
						|| (response.updateBuilds && response.updateBuilds.length)
					)
				) {
					return _this.processResponse( response );
				}
			} );
	};

	this.processResponse = function( response )
	{
		var gamePromises = response.games.map( function( game )
		{
			return _this.syncGame( game.id, game );
		} );

		var packagePromises = response.builds.map( function( build )
		{
			return _this.syncPackage( build.game_package_id, response );
		} );

		var updateBuildsPromises = response.updateBuilds.map( function( data )
		{
			return _this.updatePackage( data['packageId'], data['newBuildId'] );
		} );

		var promises = gamePromises.concat( packagePromises ).concat( updateBuildsPromises );
		return $q.all( promises );
	};

	this.syncGame = function( id, data )
	{
		return LocalDb.transaction( 'rw', [ LocalDb_Game ], function()
		{
			return LocalDb_Game.fetch( id )
				.then( function( localGame )
				{
					// Assign so we don't lose fields.
					var newGame = LocalDb_Game.fromGame( data );
					localGame.assign( newGame );
					return localGame.$save();
				} );
		} );
	};

	this.syncPackage = function( id, data )
	{
		return LocalDb.transaction( 'rw', [ LocalDb_Package ], function()
		{
			return LocalDb_Package.fetch( id )
				.then( function( localPackage )
				{
					var _package = _.find( data.packages, { id: localPackage.id } );
					var _release = _.find( data.releases, { id: localPackage.release.id } );
					var _build = _.find( data.builds, { id: localPackage.build.id } );
					var _launchOptions = _.where( data.launchOptions, { game_build_id: localPackage.build.id } );

					// Assign so we don't lose fields.
					var newPackage = LocalDb_Package.fromPackageInfo( _package, _release, _build, _launchOptions );
					localPackage.assign( newPackage );
					return localPackage.$save();
				} );
		} );
	};

	this.updatePackage = function( packageId, newBuildId )
	{
		return LocalDb_Package.fetch( parseInt( packageId, 10 ) )
			.then( function( localPackage )
			{
				return localPackage.$startUpdate( newBuildId );
			} );
	};
} );
