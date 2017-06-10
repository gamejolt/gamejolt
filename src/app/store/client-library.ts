import { State, namespace, Action, Mutation } from 'vuex-class';
import { LocalDbPackage } from '../components/client/local-db/package/package.model';
import { LocalDbGame } from '../components/client/local-db/game/game.model';
import { VuexModule, VuexStore, VuexAction, VuexMutation, VuexGetter } from '../../lib/gj-lib-client/utils/vuex';
import { db } from '../components/client/local-db/local-db.service';
import { PatchHandle, Patcher, Uninstaller } from 'client-voodoo';
import { ClientInstaller } from '../components/client/installer/installer.service';
import { Settings } from '../components/settings/settings.service';
import * as path from 'path';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { GamePackage } from '../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../lib/gj-lib-client/components/game/release/release.model';
import { GameBuild } from '../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { Game } from '../../lib/gj-lib-client/components/game/game.model';
import { HistoryTick } from '../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { fuzzysearch } from '../../lib/gj-lib-client/utils/string';
import { stringSort } from '../../lib/gj-lib-client/utils/array';

export const ClientLibraryState = namespace( 'clientLibrary', State );
export const ClientLibraryAction = namespace( 'clientLibrary', Action );
export const ClientLibraryMutation = namespace( 'clientLibrary', Mutation );

export type Actions = {
	'clientLibrary/bootstrap': undefined;
	'clientLibrary/clear': undefined;
	'clientLibrary/retryInstallPackage': LocalDbPackage;
	'clientLibrary/installPackage': [Game, GamePackage, GameRelease, GameBuild, GameBuildLaunchOption[]];
	'clientLibrary/_installPackage': [LocalDbGame, LocalDbPackage];
	'clientLibrary/updatePackage': [LocalDbPackage, number];
	'clientLibrary/uninstallPackage': LocalDbPackage;
	'clientLibrary/_uninstallPackage': number;
	'clientLibrary/cancelPatchingPackage': LocalDbPackage;
};

export type Mutations = {
	'clientLibrary/_bootstrap': {
		packages: LocalDbPackage[],
		games: LocalDbGame[],
	};
	'clientLibrary/setPatchingPackage': [LocalDbPackage, PatchHandle];
	'clientLibrary/unsetPatchingPackage': LocalDbPackage;
	'clientLibrary/setCurrentlyUninstalling': [LocalDbPackage, Promise<void>];
	'clientLibrary/unsetCurrentlyUninstalling': LocalDbPackage;
	'clientLibrary/pausePatchingPackage': LocalDbPackage;
	'clientLibrary/resumePatchingPackage': LocalDbPackage;
	'clientLibrary/setGameData': [LocalDbGame, Game];
	'clientLibrary/setPackageData': [LocalDbPackage, GamePackage, GameRelease, GameBuild, GameBuildLaunchOption[]];
	'clientLibrary/setPackageUpdateData': [LocalDbPackage, GamePackage, GameRelease, GameBuild, GameBuildLaunchOption[]];
	'clientLibrary/setPackageInstalled': LocalDbPackage;
	'clientLibrary/setPackageUpdated': LocalDbPackage;
	'clientLibrary/setPackageUninstalling': LocalDbPackage;
	'clientLibrary/setPackageInstallState': [LocalDbPackage, LocalDbPackage['install_state']];
	'clientLibrary/setPackageUpdateState': [LocalDbPackage, LocalDbPackage['update_state']];
	'clientLibrary/setPackageRemoveState': [LocalDbPackage, LocalDbPackage['remove_state']];
	'clientLibrary/setPackageInstallDir': [LocalDbPackage, LocalDbPackage['install_dir']];
	'clientLibrary/setPackagePatchQueued': [LocalDbPackage, LocalDbPackage['patch_queued']];
	'clientLibrary/setPackagePatchPaused': [LocalDbPackage, LocalDbPackage['patch_paused']];
	'clientLibrary/setPackageDownloadProgress': [LocalDbPackage, LocalDbPackage['download_progress']];
	'clientLibrary/setPackageUnpackProgress': [LocalDbPackage, LocalDbPackage['unpack_progress']];
};

@VuexModule()
export class ClientLibraryStore extends VuexStore<ClientLibraryStore, Actions, Mutations>
{
	packages: LocalDbPackage[] = [];
	games: LocalDbGame[] = [];

	currentlyPatching: { [packageId: number]: PatchHandle } = {};
	numPatching = 0;

	private currentlyUninstalling: { [packageId: number]: Promise<void> } = {};

	private _bootstrapPromise: Promise<void> | null = null;

	@VuexAction
	async bootstrap()
	{
		if ( this._bootstrapPromise ) {
			return;
		}

		// Make sure we pull in the queue settings.
		ClientInstaller.checkQueueSettings();

		// This will retry to install anything that was installing before client was closed.
		for ( let localPackage of this.packages ) {
			if ( localPackage.isPatching && !localPackage.isPatchPaused ) {
				this.retryInstallPackage( localPackage );
			}
		}

		this._bootstrapPromise = Promise.all( [
			db.packages.toArray(),
			db.games.toArray(),
		] ).then( ( [packages, games] ) =>
		{
			this._bootstrap( {packages, games} );
		} );
		return this._bootstrapPromise;
	}

	@VuexMutation
	private _bootstrap( {packages, games}: Mutations['clientLibrary/_bootstrap'] )
	{
		this.packages = packages;
		this.games = games;
	}

	@VuexAction
	async clear()
	{
		if ( this._bootstrapPromise ) {
			await this._bootstrapPromise;
		}

		// TODO: clear stuff
		this._bootstrapPromise = null;
	}

	get packagesById()
	{
		return this.packages.reduce<{ [packageId: number]: LocalDbPackage }>( ( accum, _package ) =>
		{
			accum[_package.id] = _package;
			return accum;
		}, {} );
	}

	get gamesById()
	{
		return this.games.reduce<{ [gameId: number]: LocalDbGame }>( ( accum, game ) =>
		{
			accum[game.id] = game;
			return accum;
		}, {} );
	}

	get packagesByGameId()
	{
		return this.packages.reduce<{ [gameId: number]: LocalDbPackage[] }>( ( accum, _package ) =>
		{
			if ( !accum[_package.game_id] ) {
				accum[_package.game_id] = [];
			}
			accum[_package.game_id].push( _package );
			return accum;
		}, {} );
	}

	get currentPatchingProgress()
	{
		if ( !this.numPatching ) {
			return null;
		}

		let currentProgress = 0;
		let numPatching = this.numPatching;
		for ( let packageIdStr in this.currentlyPatching ) {
			const packageId = parseInt( packageIdStr, 10 );
			const progress = this.getPackagePatchProgress( packageId );

			// If the progress is null, we don't count that package progress as part of the total progress,
			// because it means there was some unexpected error with the stored package.
			if ( progress == null ) {
				numPatching -= 1;
				continue;
			}

			currentProgress += progress;
		}
		return currentProgress / numPatching;
	}

	@VuexGetter
	getPackagePatchProgress( packageId: number )
	{
		const localPackage = this.packages[ packageId ];
		if ( localPackage.download_progress ) {
			return localPackage.download_progress.progress;
		}
		else if ( localPackage.unpack_progress ) {
			return localPackage.unpack_progress.progress;
		}
		return null;
	}

	@VuexAction
	async retryInstallPackage( localPackage: Actions['clientLibrary/retryInstallPackage'] )
	{
		// Reset states.
		const downloadStates = [
			LocalDbPackage.DOWNLOADING,
			LocalDbPackage.DOWNLOAD_FAILED,
		];

		const unpackStates = [
			LocalDbPackage.UNPACKING,
			LocalDbPackage.UNPACK_FAILED,
		];

		let promise: Promise<void>;
		if ( downloadStates.indexOf( localPackage.install_state || '' ) !== -1 ) {
			this.setPackageInstallState( [ localPackage, LocalDbPackage.PATCH_PENDING ] );
			promise = db.packages.put( localPackage );
		}
		else if ( unpackStates.indexOf( localPackage.install_state || '' ) !== -1 ) {
			this.setPackageInstallState( [ localPackage, LocalDbPackage.DOWNLOADED ] );
			promise = db.packages.put( localPackage );
		}
		else if ( downloadStates.indexOf( localPackage.update_state || '' ) !== -1 ) {
			this.setPackageUpdateState( [ localPackage, LocalDbPackage.PATCH_PENDING ] );
			promise = db.packages.put( localPackage );
		}
		else if ( unpackStates.indexOf( localPackage.update_state || '' ) !== -1 ) {
			this.setPackageUpdateState( [ localPackage, LocalDbPackage.DOWNLOADED ] );
			promise = db.packages.put( localPackage );
		}
		else {
			promise = Promise.resolve();
		}

		await promise;
		return this._installPackage( [this.games[ localPackage.game_id ], localPackage] );
	}

	@VuexAction
	async _installPackage( [localGame, localPackage]: Actions['clientLibrary/_installPackage'] )
	{
		const operation = localPackage.install_state ? 'install' : 'update';
		let packageTitle = (localPackage.title || localGame.title);
		if ( packageTitle !== localGame.title ) {
			packageTitle += ' for ' + localGame.title;
		}

		try {
			let needsSaving = false;

			// We freeze the installation directory in time.
			if ( !localPackage.install_dir ) {
				this.setPackageInstallDir( [ localPackage, path.join(
					Settings.get( 'game-install-dir' ),
					localGame.slug + '-' + localGame.id,
					(localPackage.title || 'default') + '-' + localPackage.id
				) ] );
				needsSaving = true;
			}

			// If we were paused before, let's resume.
			// This happens if they paused, then restarted client. The patch would still be paused
			// but if they click resume we want to start a new install again.
			if ( localPackage.isPatchPaused ) {
				this.setPackagePatchPaused( [localPackage, false] );
				needsSaving = true;
			}

			if ( needsSaving ) {
				await db.packages.put( localPackage );
			}

			const getDownloadUrl = function()
			{
				return localPackage.getDownloadUrl()
					.then( ( response ) => response.downloadUrl );
			};

			const patchHandle = Patcher.patch( getDownloadUrl, localPackage );

			patchHandle
				.onDownloading( () =>
				{
					if ( localPackage.install_state ) {
						this.setPackageInstallState( [ localPackage, LocalDbPackage.DOWNLOADING ] );
						db.packages.put( localPackage );
					}
					else if ( localPackage.update_state ) {
						this.setPackageUpdateState( [ localPackage, LocalDbPackage.DOWNLOADING ] );
						db.packages.put( localPackage );
					}
				} )
				.onProgress( 1, ( progress ) =>
				{
					this.setPackageDownloadProgress( [ localPackage, progress ] );
					db.packages.put( localPackage );
				} )
				.onPatching( () =>
				{
					// No longer needed.
					this.setPackageDownloadProgress( [ localPackage, null ] );

					if ( localPackage.install_state ) {
						this.setPackageInstallState( [ localPackage, LocalDbPackage.UNPACKING ] );
						db.packages.put( localPackage );
					}
					else if ( localPackage.update_state ) {
						this.setPackageUpdateState( [ localPackage, LocalDbPackage.UNPACKING ] );
						db.packages.put( localPackage );
					}
				} )
				.onExtractProgress( 1, ( progress ) =>
				{
					this.setPackageUnpackProgress( [ localPackage, progress ] );
					db.packages.put( localPackage );
				} )
				.onPaused( ( wasQueued ) =>
				{
					if ( wasQueued ) {
						this.setPackagePatchQueued( [ localPackage, true ] );
					}
					else {
						this.setPackagePatchPaused( [ localPackage, true ] );
					}
					db.packages.put( localPackage );
				} )
				.onResumed( ( wasQueued ) =>
				{
					if ( wasQueued ) {
						this.setPackagePatchQueued( [ localPackage, false ] );
					}
					else {
						this.setPackagePatchPaused( [ localPackage, false ] );
					}
					db.packages.put( localPackage );
				} )
				.start();

			this.setPatchingPackage( [ localPackage, patchHandle ] );
			await patchHandle.promise;

			this.unsetPatchingPackage( localPackage );
			if ( localPackage.install_state ) {
				this.setPackageInstalled( localPackage );
			}
			else if ( localPackage.update_state ) {
				this.setPackageUpdated( localPackage );
			}
			await db.packages.put( localPackage );

			const action = operation === 'install' ? 'finished installing' : 'updated to the latest version';
			const title = operation === 'install' ? 'Game Installed' : 'Game Updated';
			Growls.success( packageTitle + ' has ' + action + '.', title );
			return true;
		}
		catch ( err ) {
			console.error( err );

			const action = operation === 'install' ? 'install' : 'update';
			const title = operation === 'install' ? 'Installation Failed' : 'Update Failed';
			Growls.error( packageTitle + ' failed to ' + action + '.', title );

			if ( localPackage.install_state === LocalDbPackage.DOWNLOADING ) {
				this.setPackageInstallState( [ localPackage, LocalDbPackage.DOWNLOAD_FAILED ] );
				db.packages.put( localPackage );
			}
			else if ( localPackage.install_state === LocalDbPackage.UNPACKING ) {
				this.setPackageInstallState( [ localPackage, LocalDbPackage.UNPACK_FAILED ] );
				db.packages.put( localPackage );
			}
			else if ( localPackage.update_state === LocalDbPackage.DOWNLOADING ) {
				this.setPackageUpdateState( [ localPackage, LocalDbPackage.DOWNLOAD_FAILED ] );
				db.packages.put( localPackage );
			}
			else if ( localPackage.update_state === LocalDbPackage.UNPACKING ) {
				this.setPackageUpdateState( [ localPackage, LocalDbPackage.UNPACK_FAILED ] );
				db.packages.put( localPackage );
			}

			this.unsetPatchingPackage( localPackage );
			return false;
		}
	}

	@VuexMutation
	setPatchingPackage( [localPackage, patchHandle]: Mutations['clientLibrary/setPatchingPackage'] )
	{
		if ( this.currentlyPatching[localPackage.id] ) {
			return;
		}

		this.currentlyPatching[localPackage.id] = patchHandle;
		++this.numPatching;
	}

	@VuexMutation
	unsetPatchingPackage( localPackage: Mutations['clientLibrary/unsetPatchingPackage'] )
	{
		if ( !this.currentlyPatching[localPackage.id] ) {
			return;
		}

		delete this.currentlyPatching[localPackage.id];
		--this.numPatching;
	}

	@VuexMutation
	setCurrentlyUninstalling( [localPackage, uninstallPromise]: Mutations['clientLibrary/setCurrentlyUninstalling'] )
	{
		if ( this.currentlyUninstalling[localPackage.id] ) {
			return;
		}

		this.currentlyUninstalling[localPackage.id] = uninstallPromise;
	}

	@VuexMutation
	unsetCurrentlyUninstalling( localPackage: Mutations['clientLibrary/unsetCurrentlyUninstalling'] )
	{
		if ( !this.currentlyUninstalling[localPackage.id] ) {
			return;
		}

		delete this.currentlyUninstalling[localPackage.id];
	}

	@VuexMutation
	pausePatchingPackage( localPackage: Mutations['clientLibrary/pausePatchingPackage'] )
	{
		const handle = this.currentlyPatching[localPackage.id];
		if ( !handle ) {
			throw new Error( 'Package is not currently patching.' );
		}

		handle.stop();
	}

	@VuexMutation
	resumePatchingPackage( localPackage: Mutations['clientLibrary/resumePatchingPackage'] )
	{
		const handle = this.currentlyPatching[localPackage.id];
		if ( !handle ) {
			return this.retryInstallPackage( localPackage );
		}

		handle.start();
	}

	@VuexAction
	cancelPatchingPackage( localPackage: Actions['clientLibrary/cancelPatchingPackage'] )
	{
		return new Promise<void>( ( resolve ) =>
		{
			const patchHandle = this.currentlyPatching[localPackage.id];
			if ( !patchHandle ) {
				resolve();
				return;
			}

			// This is absurd, ylivay.
			// TODO promisify the new client voodoo like no tomorrow.
			patchHandle.onCanceled( () =>
			{
				this.unsetPatchingPackage( localPackage );
				resolve();
			} );

			patchHandle.cancel();
		} );
	}

	@VuexAction
	async installPackage( [game, _package, release, build, launchOptions]: Actions['clientLibrary/installPackage'] )
	{
		HistoryTick.sendBeacon( 'game-build', build.id, { sourceResource: 'Game', sourceResourceId: game.id } );
		HistoryTick.sendBeacon( 'game-build-install', build.id, { sourceResource: 'Game', sourceResourceId: game.id } );

		const localGame = new LocalDbGame();
		this.setGameData( [ localGame, game ] );
		const localPackage = new LocalDbPackage();
		this.setPackageData( [ localPackage, _package, release, build, launchOptions ] );

		await db.transaction( 'rw', [ db.games, db.packages ], () =>
		{
			return Promise.all( [
				db.games.put( localGame ),
				db.packages.put( localPackage ),
			] );
		} );

		return this._installPackage( [ localGame, localPackage ] );
	}

	@VuexAction
	async updatePackage( [localPackage, newBuildId]: Actions['clientLibrary/updatePackage'] )
	{
		// If this package isn't installed (and at rest), we don't update.
		// We also don't update if we're currently running the game. Imagine that happening!
		if ( !localPackage.isSettled || localPackage.isRunning ) {
			return false;
		}

		const localGame = this.gamesById[ localPackage.game_id ];
		if ( !localGame ) {
			return false;
		}

		const response = await Api.sendRequest( '/web/client/get-build-for-update/' + newBuildId, null, { detach: true } );
		if ( !response.package ) {
			return false;
		}

		this.setPackageUpdateData( [ localPackage, response.package, response.release, response.build, response.launchOptions ] );
		await db.packages.put( localPackage );

		return this._installPackage( [ localGame, localPackage ] );
	}

	@VuexAction
	async uninstallPackage( localPackage: Actions['clientLibrary/uninstallPackage'] )
	{
		let localGame: LocalDbGame | undefined;

		// We just use this so they don't click "uninstall" twice in a row.
		// No need to save to the DB.
		let uninstallingPromise = this.currentlyUninstalling[ localPackage.id ];
		if ( uninstallingPromise ) {
			return uninstallingPromise;
		}

		uninstallingPromise = db.transaction( 'rw', [ db.games, db.packages ], async () =>
		{
			// Are we removing a current install?
			const wasInstalling = localPackage.isInstalling;

			try {
				// Cancel any installs first.
				// It may or may not be patching.
				await this.cancelPatchingPackage( localPackage );

				// TODO: do we need to refetch from localdb or can we just reference our resource?
				localGame = await db.games.get( localPackage.game_id );

				// Make sure we're clean.
				// TODO: do we need to clean update state?
				this.setPackageUninstalling( localPackage );
				await db.packages.put( localPackage );

				// TODO: verify result of uninstallation? Roll back?
				await this._uninstallPackage( localPackage.id );

				// Get the number of packages in this game.
				const count = await db.packages.where( 'game_id' ).equals( localPackage.game_id ).count();

				// Note that some times a game is removed before the package (really weird cases).
				// We still want the remove to go through, so be sure to skip this situation.
				// If this is the last package for the game, remove the game since we no longer need it.
				if ( localGame && count <= 1 ) {
					await db.games.delete( localGame.id );
				}

				await db.packages.delete( localPackage.id );

				if ( !wasInstalling ) {
					Growls.success(
						'Removed '
							+ (localPackage.title || (localGame ? localGame.title : 'the package'))
							+ ' from your computer.',
						'Package Removed'
					);
				}
			}
			catch ( err ) {
				console.error( err );

				if ( wasInstalling ) {
					Growls.error( 'Could not stop the installation.' );
				}
				else {
					Growls.error(
						'Could not remove '
							+ (localPackage.title || (localGame ? localGame.title : 'the package'))
							+ '.',
						'Remove Failed'
					);
				}

				this.setPackageRemoveState( [ localPackage, LocalDbPackage.REMOVE_FAILED ] );
				await db.packages.put( localPackage );
				this.unsetCurrentlyUninstalling( localPackage );
			}
		} );

		this.setCurrentlyUninstalling( [ localPackage, uninstallingPromise ] );
		return uninstallingPromise;
	}

	@VuexAction
	async _uninstallPackage( packageId: Actions['clientLibrary/_uninstallPackage'] )
	{
		const localPackage = this.packagesById[packageId];
		if ( !localPackage ) {
			throw new Error( 'Package isn\'t installed' );
		}

		// TODO: verify that package is currently uninstallable? (not currently installing or playing)
		return Uninstaller.uninstall( localPackage ).promise;
	}

	@VuexMutation
	setGameData( [localGame, game]: Mutations['clientLibrary/setGameData'] )
	{
		localGame.id = game.id;
		localGame.title = game.title;
		localGame.slug = game.slug;
		localGame.img_thumbnail = game.img_thumbnail;
		localGame.compatibility = game.compatibility;
		localGame.modified_on = game.modified_on;

		const dev = game.developer;
		localGame.developer = {
			id: dev.id,
			username: dev.username,
			name: dev.name,
			display_name: dev.display_name,
			slug: dev.slug,
			img_avatar: dev.img_avatar,
		};
	}

	@VuexMutation
	setPackageData( [localPackage, _package, release, build, launchOptions]: Mutations['clientLibrary/setPackageData'] )
	{
		_setPackageData( localPackage, _package, release, build, launchOptions );
	}

	@VuexMutation
	setPackageUpdateData( [localPackage, _package, release, build, launchOptions]: Mutations['clientLibrary/setPackageUpdateData'] )
	{
		localPackage.update = new LocalDbPackage();
		_setPackageData( localPackage.update, _package, release, build, launchOptions );
		localPackage.update_state = LocalDbPackage.PATCH_PENDING;
	}

	@VuexMutation
	setPackageInstalled( localPackage: Mutations['clientLibrary/setPackageInstalled'] )
	{
		// Remove any stuff only needed while installing.
		localPackage.install_state = null;
		localPackage.download_progress = null;
		localPackage.unpack_progress = null;
		localPackage.patch_paused = null;
		localPackage.patch_queued = null;
	}

	@VuexMutation
	setPackageUpdated( localPackage: Mutations['clientLibrary/setPackageUpdated'] )
	{
		// Copy the new package into this one.
		// this.assign( this.update );
		// TODO: validate Object.assign is good enough a replacement for model.assign
		Object.assign( localPackage, localPackage.update );

		// Remove any stuff only needed while updating.
		localPackage.update = null;
		localPackage.update_state = null;
		localPackage.download_progress = null;
		localPackage.unpack_progress = null;
		localPackage.patch_paused = null;
		localPackage.patch_queued = null;
	}

	@VuexMutation
	setPackageUninstalling( localPackage: Mutations['clientLibrary/setPackageUninstalling'] )
	{
		// TODO: do we need to clean update state?
		localPackage.install_state = null;
		localPackage.download_progress = null;
		localPackage.unpack_progress = null;
		localPackage.patch_paused = null;
		localPackage.patch_queued = null;
		localPackage.remove_state = LocalDbPackage.REMOVING;
	}

	@VuexMutation
	setPackageInstallState( [localPackage, state]: Mutations['clientLibrary/setPackageInstallState'] )
	{
		localPackage.install_state = state;
	}

	@VuexMutation
	setPackageUpdateState( [localPackage, state]: Mutations['clientLibrary/setPackageUpdateState'] )
	{
		localPackage.update_state = state;
	}

	@VuexMutation
	setPackageRemoveState( [localPackage, state]: Mutations['clientLibrary/setPackageRemoveState'] )
	{
		localPackage.remove_state = state;
	}

	@VuexMutation
	setPackageInstallDir( [localPackage, dir]: Mutations['clientLibrary/setPackageInstallDir'] )
	{
		localPackage.install_dir = dir;
	}

	@VuexMutation
	setPackagePatchQueued( [localPackage, queued]: Mutations['clientLibrary/setPackagePatchQueued'] )
	{
		localPackage.patch_queued = queued;
	}

	@VuexMutation
	setPackagePatchPaused( [localPackage, paused]: Mutations['clientLibrary/setPackagePatchPaused'] )
	{
		localPackage.patch_paused = paused;
	}

	@VuexMutation
	setPackageDownloadProgress( [localPackage, progress]: Mutations['clientLibrary/setPackageDownloadProgress'] )
	{
		localPackage.download_progress = progress;
	}

	@VuexMutation
	setPackageUnpackProgress( [localPackage, progress]: Mutations['clientLibrary/setPackageUnpackProgress'] )
	{
		localPackage.unpack_progress = progress;
	}

	@VuexGetter
	findActiveForGame( gameId: number )
	{
		const packages = this.packagesByGameId[gameId];

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

	@VuexGetter
	searchInstalledGames( query: string )
	{
		let games = this.games.filter( ( game ) => fuzzysearch( query.toLowerCase(), game.title.toLowerCase() ) );

		if ( games.length > 0 ) {
			games = games
				.sort( ( a, b ) => stringSort( a.title, b.title ) )
				.slice( 0, 3 );  // Only return top 3.
		}

		return Promise.resolve( games );
	}
}

function _setPackageData(
	localPackage: LocalDbPackage,
	_package: GamePackage,
	release: GameRelease,
	build: GameBuild,
	launchOptions: GameBuildLaunchOption[]
)
{
	localPackage.id = _package.id;
	localPackage.game_id = _package.game_id;
	localPackage.title = _package.title;
	localPackage.description = _package.description;

	localPackage.release = {
		id: release.id,
		version_number: release.version_number,
	};

	localPackage.build = {
		id: build.id,
		folder: build.folder,
		type: build.type,
		archive_type: build.archive_type,
		os_windows: build.os_windows,
		os_windows_64: build.os_windows_64,
		os_mac: build.os_mac,
		os_mac_64: build.os_mac_64,
		os_linux: build.os_linux,
		os_linux_64: build.os_linux_64,
		os_other: build.os_other,
		modified_on: build.modified_on,
	};

	localPackage.file = {
		id: build.primary_file.id,
		filename: build.primary_file.filename,
		filesize: build.primary_file.filesize,
	};

	// All launch options are passed in.
	// Let's just pull the ones for our build.
	const _launchOptions: typeof LocalDbPackage.prototype.launch_options = [];
	for ( let launchOption of launchOptions ) {
		if ( launchOption.game_build_id !== build.id ) {
			continue;
		}

		_launchOptions.push( {
			id: launchOption.id,
			os: launchOption.os,
			executable_path: launchOption.executable_path,
		} );
	}
	localPackage.launch_options = _launchOptions;
}
