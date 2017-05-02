import { ClientLibraryState } from './library';

/**
 * Returns a package that is representative of this game's current state.
 * For example, if a package is installing, we will return that.
 * It should return a single package for a game, even if they have multiple
 * installed.
 */
export function findActiveForGame( state: ClientLibraryState, gameId: number )
{
	const packages = state.packagesByGameId[gameId];

	if ( !packages || !packages.length ) {
		return null;
	}

	for ( let i = 0; i < packages.length; i++ ) {
		if ( packages[ i ].install_state ) {
			return packages[ i ];
		}
	}

	return packages[0];
}


// import { LocalDbPackage } from '../local-db/package/package.model';
// import { LocalDbGame } from '../local-db/game/game.model';
// import { db } from '../local-db/local-db.service';
// import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
// import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
// import { GameRelease } from '../../../../lib/gj-lib-client/components/game/release/release.model';
// import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
// import { GameBuildLaunchOption } from '../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
// import { HistoryTick } from '../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
// import { Uninstaller } from 'client-voodoo';
// import { ClientInstaller } from '../installer/installer.service';
// import { ClientLauncher } from '../launcher/launcher.service';

// export class ClientLibrary
// {
// 	static packages: { [packageId: number]: LocalDbPackage } = {};
// 	static packagesByGame: { [gameId: number]: LocalDbPackage[] } = {};
// 	static games: { [gameId: number]: LocalDbGame } = {};

// 	static init()
// 	{
// 		this.setupDbWatcher()
// 			.then( () =>
// 			{
// 				// This will retry to continue uninstalling any packages that failed to uninstall.
// 				for ( let packageId in ClientLibrary.packages ) {
// 					const localPackage = ClientLibrary.packages[packageId];
// 					// Don't retry if the remove failed.
// 					if ( localPackage.isRemoving ) {
// 						localPackage.uninstall();
// 					}
// 				}
// 			} );
// 	}

// 	// We set up watchers through hooks into dexie.
// 	// This will ensure that anything that happens to the indexeddb will also get mapped into this class.
// 	static setupDbWatcher()
// 	{
// 		const watchThese = [
// 			{
// 				model: LocalDbPackage,
// 				table: db.packages,
// 				key: 'packages',
// 			},
// 			{
// 				model: LocalDbGame,
// 				table: db.games,
// 				key: 'games',
// 			},
// 		];

// 		// We have to make sure we do everything when the transaction completes and not before.
// 		for ( let watchInfo of watchThese )
// 		{
// 			watchInfo.table.hook( 'creating' ).subscribe( function( key, obj, trans )
// 			{
// 				trans.on( 'complete', function()
// 				{
// 					const newModel = new watchInfo.model();
// 					Object.assign( newModel, obj );
// 					// TODO: vue reactivity?
// 					(ClientLibrary as any )[ watchInfo.key ][ key ] = newModel;

// 					if ( watchInfo.key === 'packages' ) {
// 						ClientLibrary.packagesByGame = _.groupBy( ClientLibrary.packages, 'game_id' );
// 					}
// 				} );
// 			} );

// 			watchInfo.table.hook( 'updating' ).subscribe( function( mods, key, _ /*obj*/, trans )
// 			{
// 				trans.on( 'complete', function()
// 				{
// 					const localPackage = (ClientLibrary as any)[ watchInfo.key ][ key ];
// 					for ( let i in mods ) {
// 						if ( !mods.hasOwnProperty( i ) ) {
// 							continue;
// 						}
// 						localPackage[ i ] = mods[ i ];
// 						// TODO: vue reactivity?
// 					}
// 				} );
// 			} );

// 			watchInfo.table.hook( 'deleting' ).subscribe( function( key, _ /*obj*/, trans )
// 			{
// 				trans.on( 'complete', function()
// 				{
// 					delete (ClientLibrary as any )[ watchInfo.key ][ key ];

// 					if ( watchInfo.key === 'packages' ) {
// 						ClientLibrary.packagesByGame = _.groupBy( ClientLibrary.packages, 'game_id' );
// 					}
// 				} );
// 			} );
// 		}

// 		const fetchers = watchThese.map( ( watchInfo ) => watchInfo.table.toArray() );
// 		return Promise.all( fetchers )
// 			.then( ( data ) =>
// 			{
// 				for ( let i = 0; i < watchThese.length; i++ ) {
// 					(this as any )[ watchThese[ i ].key ] = _.indexBy( data[ i ], 'id' );
// 				}

// 				this.packagesByGame = _.groupBy( this.packages, 'game_id' );

// 				ClientInstaller.init();
// 				ClientLauncher.init();
// 			} );
// 	};

// 	/**
// 	 * Returns a package that is representative of this game's current state.
// 	 * For example, if a package is installing, we will return that.
// 	 * It should return a single package for a game, even if they have multiple
// 	 * installed.
// 	 */
// 	static findActiveForGame( gameId: number )
// 	{
// 		const packages = _.where( this.packages, { game_id: gameId } );

// 		if ( !packages.length ) {
// 			return null;
// 		}

// 		for ( let i = 0; i < packages.length; i++ ) {
// 			if ( packages[ i ].install_state ) {
// 				return packages[ i ];
// 			}
// 		}

// 		return packages[0];
// 	}

// 	static installPackage(
// 		_game: Game,
// 		_package: GamePackage,
// 		_release: GameRelease,
// 		_build: GameBuild,
// 		_launchOptions: GameBuildLaunchOption[],
// 	)
// 	{
// 		HistoryTick.sendBeacon( 'game-build', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );
// 		HistoryTick.sendBeacon( 'game-build-install', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );

// 		const game = LocalDbGame.fromGame( _game );
// 		const localPackage = LocalDbPackage.createForInstall( _package, _release, _build, _launchOptions );

// 		db
// 			.transaction( 'rw', [ db.games, db.packages ], function()
// 			{
// 				return Promise.all( [ db.games.put( game ), db.packages.put( localPackage ) ] );
// 			} )
// 			.then( function()
// 			{
// 				return ClientInstaller.install( game, localPackage );
// 			} );
// 	}

// 	static removePackage( package_: LocalDbPackage )
// 	{
// 		return Uninstaller.uninstall( package_ ).promise;
// 	}
// }
