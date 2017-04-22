import { db } from '../local-db/local-db.service';
import { PatchHandle, VoodooQueue, Patcher } from 'client-voodoo';
import { ClientLibrary } from '../library/library.service';
import { Settings } from '../../settings/settings.service';
import { LocalDbPackage } from '../local-db/package/package.model';
import { LocalDbGame } from '../local-db/game/game.model';
import * as path from 'path';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

export interface ICurrentPatch
{
	packageId: number;
	handle: PatchHandle;
}

export class ClientInstaller
{
	static currentlyPatching: ICurrentPatch[];
	static numPatching = 0;

	static init()
	{
		// Make sure we pull in the queue settings.
		this.checkQueueSettings();

		// This will retry to install anything that was installing before client was closed.
		for ( let packageId in ClientLibrary.packages ) {
			const localPackage = ClientLibrary.packages[ packageId ];
			if ( localPackage.isPatching && !localPackage.isPatchPaused ) {
				this.retryInstall( localPackage );
			}
		}

		// We set the system progress bar as we patch.
		// Should be the accumulation of all current patches ongoing.

		// TODO watch currentProgress and refresh progress when it changes.
		// $rootScope.$watch( function()
		// {
		// 	if ( !_this.numPatching ) {
		// 		return null;
		// 	}

		// 	var currentProgress = 0;
		// 	angular.forEach( _this.currentlyPatching, function( handle, packageId )
		// 	{
		// 		currentProgress += _this.getPackagePatchProgress( packageId ) || 0;
		// 	} );
		// 	return currentProgress / _this.numPatching;
		// },
		// function( progress )
		// {
		// 	if ( progress === null ) {
		// 		Client.clearProgressBar();
		// 		return;
		// 	}

		// 	Client.setProgressBar( progress );
		// } );
	}

	static get currentProgress()
	{
		if ( !this.numPatching ) {
			return null;
		}

		let currentProgress = 0;
		let numPatching = this.numPatching;
		for ( let patch of this.currentlyPatching ) {
			const progress = this.getPackagePatchProgress( patch.packageId );

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

	static getPackagePatchProgress( packageId: number )
	{
		const localPackage = ClientLibrary.packages[ packageId ];
		if ( localPackage.download_progress ) {
			return localPackage.download_progress.progress;
		}
		else if ( localPackage.unpack_progress ) {
			return localPackage.unpack_progress.progress;
		}
		return null;
	}

	static checkQueueSettings()
	{
		VoodooQueue.faster = {
			downloads: Settings.get( 'max-download-count' ),
			extractions: Settings.get( 'max-extract-count' ),
		};

		if ( Settings.get( 'queue-when-playing' ) ) {
			VoodooQueue.slower = {
				downloads: 0,
				extractions: 0,
			};
		}
		else {
			VoodooQueue.slower = VoodooQueue.faster;
		}
	}

	static async retryInstall( localPackage: LocalDbPackage )
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
		if ( downloadStates.indexOf( localPackage.install_state || '' ) != -1 ) {
			localPackage.install_state = LocalDbPackage.PATCH_PENDING
			promise = db.packages.put( localPackage );
		}
		else if ( unpackStates.indexOf( localPackage.install_state || '' ) != -1 ) {
			localPackage.install_state = LocalDbPackage.DOWNLOADED
			promise = db.packages.put( localPackage );
		}
		else if ( downloadStates.indexOf( localPackage.update_state || '' ) != -1 ) {
			localPackage.update_state = LocalDbPackage.PATCH_PENDING
			promise = db.packages.put( localPackage );
		}
		else if ( unpackStates.indexOf( localPackage.update_state || '' ) != -1 ) {
			localPackage.update_state = LocalDbPackage.DOWNLOADED
			promise = db.packages.put( localPackage );
		}
		else {
			promise = Promise.resolve();
		}

		await promise;
		const game = ClientLibrary.games[ localPackage.game_id ];
		return this.install( game, localPackage );
	}

	static async install( game: LocalDbGame, localPackage: LocalDbPackage )
	{
		const operation = localPackage.install_state ? 'install' : 'update';
		let packageTitle = (localPackage.title || game.title);
		if ( packageTitle != game.title ) {
			packageTitle += ' for ' + game.title;
		}

		try {
			let needsSaving = false;

			// We freeze the installation directory in time.
			if ( !localPackage.install_dir ) {
				localPackage.install_dir = path.join(
					Settings.get( 'game-install-dir' ),
					game.slug + '-' + game.id,
					(localPackage.title || 'default') + '-' + localPackage.id
				);
				needsSaving = true;
			}

			// If we were paused before, let's resume.
			// This happens if they paused, then restarted client. The patch would still be paused
			// but if they click resume we want to start a new install again.
			if ( localPackage.isPatchPaused ) {
				localPackage.patch_paused = false;
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
						localPackage.install_state = LocalDbPackage.DOWNLOADING;
						db.packages.put( localPackage );
					}
					else if ( localPackage.update_state ) {
						localPackage.update_state = LocalDbPackage.DOWNLOADING;
						db.packages.put( localPackage );
					}
				} )
				.onProgress( 1, ( progress ) =>
				{
					localPackage.download_progress = progress;
					db.packages.put( localPackage );
				} )
				.onPatching( () =>
				{
					// No longer needed.
					localPackage.download_progress = null;

					if ( localPackage.install_state ) {
						localPackage.install_state = LocalDbPackage.UNPACKING
						db.packages.put( localPackage );
					}
					else if ( localPackage.update_state ) {
						localPackage.update_state = LocalDbPackage.UNPACKING;
						db.packages.put( localPackage );
					}
				} )
				.onExtractProgress( 1, ( progress ) =>
				{
					localPackage.unpack_progress = progress;
					db.packages.put( localPackage );
				} )
				.onPaused( ( wasQueued ) =>
				{
					if ( wasQueued ) {
						localPackage.patch_queued = true;
					}
					else {
						localPackage.patch_paused = true;
					}
					db.packages.put( localPackage );
				} )
				.onResumed( ( wasQueued ) =>
				{
					if ( wasQueued ) {
						localPackage.patch_queued = false;
					}
					else {
						localPackage.patch_paused = false;
					}
					db.packages.put( localPackage );
				} )
				.start();

			this.startPatching( localPackage, patchHandle );
			await patchHandle.promise;

			this.stopPatching( localPackage );
			if ( localPackage.install_state ) {
				localPackage.setInstalled();
			}
			else if ( localPackage.update_state ) {
				localPackage.setUpdated();
			}
			await db.packages.put( localPackage );

			const action = operation == 'install' ? 'finished installing' : 'updated to the latest version';
			const title = operation == 'install' ? 'Game Installed' : 'Game Updated';
			Growls.success( packageTitle + ' has ' + action + '.', title );
		}
		catch ( err ) {
			console.error( err );

			var action = operation == 'install' ? 'install' : 'update';
			var title = operation == 'install' ? 'Installation Failed' : 'Update Failed';
			Growls.error( packageTitle + ' failed to ' + action + '.', title );

			if ( localPackage.install_state == LocalDbPackage.DOWNLOADING ) {
				localPackage.install_state = LocalDbPackage.DOWNLOAD_FAILED;
				db.packages.put( localPackage );
			}
			else if ( localPackage.install_state == LocalDbPackage.UNPACKING ) {
				localPackage.install_state = LocalDbPackage.UNPACK_FAILED;
				db.packages.put( localPackage );
			}
			else if ( localPackage.update_state == LocalDbPackage.DOWNLOADING ) {
				localPackage.update_state = LocalDbPackage.DOWNLOAD_FAILED;
				db.packages.put( localPackage );
			}
			else if ( localPackage.update_state == LocalDbPackage.UNPACKING ) {
				localPackage.update_state = LocalDbPackage.UNPACK_FAILED;
				db.packages.put( localPackage );
			}

			this.stopPatching( localPackage );
		}
	}

	private static getPatchHandleIdx( packageId: number )
	{
		return this.currentlyPatching.findIndex( ( value ) => value.packageId == packageId );
	}

	private static startPatching( localPackage: LocalDbPackage, patchHandle: PatchHandle )
	{
		if ( this.getPatchHandleIdx( localPackage.id ) == -1 ) {
			this.currentlyPatching.push( {
				packageId: localPackage.id,
				handle: patchHandle,
			} );
			++this.numPatching;
		}
	}

	private static stopPatching( localPackage: LocalDbPackage )
	{
		const idx = this.getPatchHandleIdx( localPackage.id );
		if ( idx != -1 ) {
			this.currentlyPatching.splice( idx, 1 );
			--this.numPatching;
		}
	}

	static pause( localPackage: LocalDbPackage )
	{
		const idx = this.getPatchHandleIdx( localPackage.id );
		if ( idx == -1 ) {
			throw new Error( 'Package is not installing.' );
		}

		return this.currentlyPatching[idx].handle.stop();
	}

	static resume( localPackage: LocalDbPackage )
	{
		const idx = this.getPatchHandleIdx( localPackage.id );
		if ( idx == -1 ) {
			return this.retryInstall( localPackage );
		}

		return this.currentlyPatching[idx].handle.start();
	};

	static cancel( localPackage: LocalDbPackage )
	{
		return new Promise( ( resolve ) =>
		{
			const idx = this.getPatchHandleIdx( localPackage.id );
			if ( idx == -1 ) {
				resolve();
				return;
			}

			var patchHandle = this.currentlyPatching[idx].handle;

			// This is absurd, ylivay.
			// TODO promisify the new client voodoo like no tomorrow.
			patchHandle.onCanceled( () =>
			{
				this.stopPatching( localPackage );
				resolve();
			} );

			patchHandle.cancel();
		} );
	}
}
