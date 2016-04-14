angular.module( 'App.Client.Library' )
.run( function( Client_Library )
{
	Client_Library.setupDbWatcher()
		.then( function()
		{
			// This will retry to continue uninstalling any packages that failed to uninstall.
			angular.forEach( Client_Library.packages, function( localPackage )
			{
				// Don't retry if the remove failed.
				if ( localPackage.isRemoving() ) {
					localPackage.$uninstall();
				}
			} );
		} );
} )
.service( 'Client_Library', function(
	$q, $timeout, $injector, $rootScope, LocalDb, LocalDb_Game, LocalDb_Package, HistoryTick )
{
	var _this = this;

	this.packages = {};
	this.packagesByGame = {};
	this.games = {};

	// We set up watchers through hooks into dexie.
	// This will ensure that anything that happens to the indexeddb will also get mapped into this class.
	this.setupDbWatcher = function()
	{
		var watchThese = [
			{
				model: LocalDb_Package,
				key: 'packages',
			},
			{
				model: LocalDb_Game,
				key: 'games',
			},
		];

		// We have to make sure we do everything when the transaction completes and not before.
		watchThese.forEach( function( watchInfo )
		{
			watchInfo.model.table().hook( 'creating', function( key, obj, trans )
			{
				trans.on( 'complete', function()
				{
					_this[ watchInfo.key ][ key ] = new watchInfo.model( obj );

					if ( watchInfo.key == 'packages' ) {
						_this.packagesByGame = _.groupBy( _this.packages, 'game_id' );
					}
				} );
			} );

			watchInfo.model.table().hook( 'updating', function( mods, key, obj, trans )
			{
				trans.on( 'complete', function()
				{
					var localPackage = _this[ watchInfo.key ][ key ];
					for ( var i in mods ) {
						localPackage[ i ] = mods[ i ];
					}
				} );
			} );

			watchInfo.model.table().hook( 'deleting', function( key, obj, trans )
			{
				trans.on( 'complete', function()
				{
					delete _this[ watchInfo.key ][ key ];

					if ( watchInfo.key == 'packages' ) {
						_this.packagesByGame = _.groupBy( _this.packages, 'game_id' );
					}
				} );
			} );
		} );

		var fetchers = watchThese.map( function( watchInfo )
		{
			return watchInfo.model.fetch();
		} );

		return $q.all( fetchers )
			.then( function( data )
			{
				for ( var i in watchThese ) {
					_this[ watchThese[ i ].key ] = _.indexBy( data[ i ], 'id' );
				}

				_this.packagesByGame = _.groupBy( _this.packages, 'game_id' );

				$rootScope.$emit( 'Client_Library.watchersSet' );
			} );
	};

	/**
	 * Returns a package that is representative of this game's current state.
	 * For example, if a package is installing, we will return that.
	 * It should return a single package for a game, even if they have multiple
	 * installed.
	 */
	this.findActiveForGame = function( gameId )
	{
		var packages = _.where( _this.packages, { game_id: gameId } );

		if ( !packages.length ) {
			return null;
		}

		for ( var i in packages ) {
			if ( packages[ i ].install_state ) {
				return packages[ i ];
			}
		}

		return packages[0];
	};

	this.installPackage = function( _game, _package, _release, _build, _launchOptions )
	{
		HistoryTick.sendBeacon( 'game-build', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );
		HistoryTick.sendBeacon( 'game-build-install', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );

		var game = LocalDb_Game.fromGame( _game );
		var localPackage = LocalDb_Package.createForInstall( _package, _release, _build, _launchOptions );

		LocalDb
			.transaction( 'rw', [ LocalDb_Game, LocalDb_Package ], function()
			{
				return $q.all( [ game.$save(), localPackage.$save() ] );
			} )
			.then( function()
			{
				return $injector.get( 'Client_Installer' ).install( game, localPackage );
			} );
	};

	this.removePackage = function( package_ )
	{
		var Uninstaller = require( 'client-voodoo' ).Uninstaller;
		return $q.when( Uninstaller.uninstall( package_ ).promise );
	};
} );
