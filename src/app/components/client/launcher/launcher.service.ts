import { LocalDbPackage } from '../local-db/package/package.model';
import * as gui from 'nw.gui';
import * as path from 'path';
import * as fs from 'fs';
import { Application, Launcher, LaunchInstanceHandle } from 'client-voodoo';
import { ClientLibrary } from '../library/library.service';
import { db } from '../local-db/local-db.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';

export class ClientLauncher
{
	static currentlyPlaying: LocalDbPackage[] = [];

	static async init()
	{
		const pidDir = path.resolve( gui.App.dataPath, 'game-pids' );
		Application.setPidDir( pidDir );

		await Application.ensurePidDir();

		// Get all running packages by looking at the game pid directory.
		const runningPackageIds = fs.readdirSync( pidDir ).map( ( filename ) =>
		{
			// Pid files are named after the package ids they are currently running.
			try {
				return parseInt( path.basename( filename ) );
			}
			catch ( err ) {
				return false;
			}
		} ).filter( ( packageId ) => !!packageId );

		// Reattach all running games after a restart.
		for ( let packageId in ClientLibrary.packages ) {
			const localPackage = ClientLibrary.packages[packageId];

			if ( runningPackageIds.indexOf( localPackage.id ) !== -1 || localPackage.isRunning ) {
				localPackage.running_pid = {
					wrapperId: localPackage.id.toString(),
				};
				db.packages.put( localPackage );

				this.reattach( localPackage );
			}
		}
	}

	static async launch( localPackage: LocalDbPackage )
	{
		const os = Device.os();
		const arch = Device.arch() || '32';

		let credentials = null;
		try {
			credentials = await Api.sendRequest( '/web/dash/token/get_for_game', { game_id: localPackage.game_id } );
		}
		catch ( e ) {
			console.log( 'Could not get game token to launch with - launching anyways' );
			console.error( e );
		}

		try {
			credentials = ( credentials && credentials.username && credentials.token ) ? { username: credentials.username, user_token: credentials.token } : null;
			const launchInstance = await Launcher.launch( localPackage, os, arch, credentials ).promise;
			return await this.attach( localPackage, launchInstance );
		}
		catch ( e ) {
			this.clear( localPackage );
			console.error( e );
			Growls.error( 'Could not launch game.' );
		}
	}

	static async reattach( localPackage: LocalDbPackage )
	{
		try {
			if ( !localPackage.running_pid ) {
				throw new Error( 'Cannot reattach to package (it isn\'t supposed to be running)' );
			}

			const launchInstance = await Launcher.attach( localPackage.running_pid );
			return await this.attach( localPackage, launchInstance );
		}
		catch ( e ) {
			console.error( e );
			this.clear( localPackage );
		}
	}

	static attach( localPackage: LocalDbPackage, launchInstance: LaunchInstanceHandle )
	{
		this.currentlyPlaying.push( localPackage );

		launchInstance.on( 'end', () =>
		{
			this.clear( localPackage );
		} );

		EventBus.emit( 'ClientLauncher.gameLaunched', this.currentlyPlaying.length );

		localPackage.running_pid = launchInstance.pid;
		return db.packages.put( localPackage );
	}

	static clear( localPackage: LocalDbPackage )
	{
		let removed = false;
		for ( let i = this.currentlyPlaying.length - 1; i >= 0; i-- )
		{
			if ( this.currentlyPlaying[i].id == localPackage.id ) {
				this.currentlyPlaying.splice( i, 1 );
				removed = true;
			}
		}

		localPackage.running_pid = null;
		db.packages.put( localPackage );

		if ( removed ) {
			EventBus.emit( 'ClientLauncher.gameClosed', this.currentlyPlaying.length );
		}
	}
}
