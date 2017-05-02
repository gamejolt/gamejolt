import { db } from '../local-db.service';
import { LocalDbGame } from '../game/game.model';
import { LocalDbPackage } from '../package/package.model';
import { Device } from '../../../../../lib/gj-lib-client/components/device/device.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

const CHECK_INTERVAL = 60 * 60 * 1000; // 1hr currently
export class LocalDbSync
{
	static init()
	{
		this.check();
		setInterval( () => this.check(), CHECK_INTERVAL )
	}

	static async check()
	{
		// We will pull our full library and try to see if any of them need to be updated.
		let games: LocalDbGame[], packages: LocalDbPackage[];
		[games, packages] = await Promise.all( [ db.games.toArray(), db.packages.toArray() ] );

		const builds = packages.map( function( localPackage )
		{
			return localPackage.build;
		} );

		const os = Device.os();
		const arch = Device.arch();

		const request: any = {
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

		const response = await Api.sendRequest( '/web/client/sync', request, {
			detach: true,

			// If we allowed it to sanitize, it would filter out arrays in the request.
			sanitizeComplexData: false,
		} );

		// Don't do anything if we don't have anything to update.
		if ( response
			&& (
				( response.builds && response.builds.length )
				|| ( response.games && response.games.length )
				|| ( response.updateBuilds && response.updateBuilds.length )
			)
		) {
			return this.processResponse( response );
		}
	}

	static processResponse( response: any )
	{
		const gamePromises = response.games.map( ( game: any ) =>
		{
			return this.syncGame( game.id, game );
		} );

		const packagePromises = response.builds.map( ( build: any ) =>
		{
			return this.syncPackage( build.game_package_id, response );
		} );

		const updateBuildsPromises = response.updateBuilds.map( ( data: any ) =>
		{
			return this.updatePackage( data['packageId'], data['newBuildId'] );
		} );

		return Promise.all( gamePromises.concat( packagePromises ).concat( updateBuildsPromises ) );
	}

	static syncGame( id: number, data: any )
	{
		return db.transaction( 'rw', db.games, function()
		{
			return db.games.get( id )
				.then( function( localGame )
				{
					if ( !localGame ) {
						throw new Error( 'Game is not set in localdb' );
					}

					// Assign so we don't lose fields.
					const newGame = LocalDbGame.fromGame( data );

					localGame.assign( newGame );
					return db.games.put( localGame );
				} );
		} );
	}

	static syncPackage( id: number, data: any )
	{
		return db.transaction( 'rw', db.packages, function()
		{
			return db.packages.get( id )
				.then( function( localPackage )
				{
					if ( !localPackage ) {
						throw new Error( 'Package is not set in localdb' );
					}

					// TODO: get rid of lodash
					const _package = (data.packages as any[]).find( ( a ) => a.id === localPackage.id );
					const _release = (data.release as any[]).find( ( a ) => a.id === localPackage.release.id );
					const _build = (data.builds as any[]).find( ( a ) => a.id === localPackage.build.id );
					const _launchOptions = (data.launchOptions as any[]).filter( ( a ) => a.game_build_id === localPackage.build.id );

					// Assign so we don't lose fields.
					localPackage.setFromPackageInfo( _package, _release, _build, _launchOptions );

					return db.packages.put( localPackage );
				} );
		} );
	}

	static async updatePackage( packageId: number, newBuildId: number )
	{
		const localPackage = await db.packages.get( packageId )
		if ( !localPackage ) {
			throw new Error( 'Package is not set in localdb' );
		}

		return localPackage.startUpdate( newBuildId );
	}
}
