// import * as angular from 'angular';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
// import { BroadcastModal } from '../broadcast-modal/broadcast-modal.service';
// import { App } from '../../app-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Settings } from '../settings/settings.service';
import { GameCollection } from '../game/collection/collection.model';

let bootstrapPromiseResolve: any = undefined;

export class Shell {
	// static notificationCount = 0;
	// static collections: GameCollection[] = [];
	// static followedCollection?: GameCollection = undefined;
	// static developerCollection?: GameCollection = undefined;
	// static ownedCollection?: GameCollection = undefined;
	// static recommendedCollection?: GameCollection = undefined;
	// static bundleCollections: GameCollection[] = [];

	// static isBootstrapped = false;
	// static bootstrapPromise = new Promise<void>(
	// 	( resolve ) => bootstrapPromiseResolve = resolve
	// );

	// private static _isLeftPaneSticky = true;
	// private static _isLeftPaneOverlayed = false;
	// private static _isRightPaneOverlayed = false;

	private static backdrop?: any = undefined;
	// private static chat?: typeof Chat = undefined;

	static init() {
		// const $rootScope = getProvider<ng.IRootScopeService>( '$rootScope' );
		// const hotkeys = getProvider<ng.hotkeys.HotkeysProvider>( 'hotkeys' );
		// this._isLeftPaneSticky = Settings.get( 'sidebar' );
		// /**
		//  * After changing states, hide all overlays.
		//  */
		// $rootScope.$on( '$stateChangeStart', () =>
		// {
		// 	// When navigating, only change the overlayed states.
		// 	this._isLeftPaneOverlayed = false;
		// 	this._isRightPaneOverlayed = false;
		// 	this.checkBackdrop();
		// } );
		// hotkeys.add( {
		// 	combo: 'm',
		// 	description: 'Toggle the sidebar menu.',
		// 	callback: () => this.toggleLeftPane(),
		// } );
		// $rootScope.$watch( () => !!getProvider<App>( 'App' ).user, async ( isLoggedIn ) =>
		// {
		// 	if ( isLoggedIn ) {
		// 		this.bootstrap();
		// 	}
		// 	else {
		// 		this.clear();
		// 	}
		// 	if ( isLoggedIn ) {
		// 		const mod = await $import( '../chat/chat.service' );
		// 		this.chat = mod.Chat as typeof Chat;
		// 		this.chat.connect();
		// 		hotkeys.add( {
		// 			combo: 'c',
		// 			description: 'Toggle the chat.',
		// 			callback: () => this.toggleRightPane(),
		// 		} );
		// 	}
		// 	else {
		// 		// Log out of chat. This will notify other tabs to disconnect from the server too.
		// 		if ( this.chat ) {
		// 			if ( this.chat.client ) {
		// 				this.chat.client.logout();
		// 			}
		// 			hotkeys.del( 'c' );
		// 		}
		// 		this.chat = undefined;
		// 	}
		// } );
	}

	// static get isLeftPaneVisible()
	// {
	// 	if ( Screen.isDesktop ) {
	// 		return this._isLeftPaneSticky;
	// 	}

	// 	return this._isLeftPaneOverlayed;
	// }

	// static get isRightPaneVisible()
	// {
	// 	return this._isRightPaneOverlayed;
	// }

	// static toggleLeftPane()
	// {
	// 	if ( Screen.isDesktop ) {
	// 		this._isLeftPaneSticky = !this._isLeftPaneSticky;
	// 	}
	// 	else {
	// 		this._isLeftPaneOverlayed = !this._isLeftPaneOverlayed;
	// 	}

	// 	this._isRightPaneOverlayed = false;
	// 	this.checkBackdrop();
	// 	Settings.set( 'sidebar', this._isLeftPaneSticky );

	// 	return this;
	// }

	// static toggleRightPane()
	// {
	// 	this._isRightPaneOverlayed = !this._isRightPaneOverlayed;
	// 	this._isLeftPaneOverlayed = false;
	// 	this.checkBackdrop();

	// 	return this;
	// }

	// static addPlaylist( playlist: GameCollection )
	// {
	// 	this.collections.push( playlist );
	// }

	// static removePlaylist( playlist: GameCollection )
	// {
	// 	const index = this.collections.findIndex( ( i ) => i._id === playlist._id );
	// 	this.collections.splice( index, 1 );
	// }

	// private static shouldShowLeftPaneBackdrop()
	// {
	// 	return this._isLeftPaneOverlayed && Screen.isMobile;
	// }

	// private static checkBackdrop()
	// {
	// 	// // Ensure we have a backdrop if anything is overlayed.
	// 	// // Otherwise ensure the backdrop is gone.
	// 	// if ( this._isRightPaneOverlayed || this.shouldShowLeftPaneBackdrop() ) {
	// 	// 	if ( this.backdrop ) {
	// 	// 		return;
	// 	// 	}

	// 	// 	const Backdrop = getProvider<any>( 'Backdrop' );
	// 	// 	this.backdrop = new Backdrop(
	// 	// 		angular.element( document.getElementById( 'shell-body' ) as HTMLElement )
	// 	// 	);

	// 	// 	this.backdrop.onCloseTrigger = () =>
	// 	// 	{
	// 	// 		// If they clicked the backdrop or something, close all overlayed panes.
	// 	// 		this._isLeftPaneOverlayed = false;
	// 	// 		this._isRightPaneOverlayed = false;
	// 	// 		this.destroyBackdrop();
	// 	// 	};
	// 	// }
	// 	// else if ( this.backdrop ) {
	// 	// 	this.destroyBackdrop();
	// 	// }
	// }

	// private static destroyBackdrop()
	// {
	// 	// this.backdrop.remove();
	// 	// this.backdrop = undefined;
	// }

	// private static async bootstrap()
	// {
	// 	// getProvider<BroadcastModal>( 'BroadcastModal' ).check();

	// 	const response = await Api.sendRequest( '/web/library' );

	// 	this.collections = GameCollection.populate( response.collections );
	// 	this.followedCollection = response.followedCollection
	// 		? new GameCollection( response.followedCollection )
	// 		: undefined;
	// 	this.developerCollection = response.developerCollection
	// 		? new GameCollection( response.developerCollection )
	// 		: undefined;
	// 	this.ownedCollection = response.ownedCollection
	// 		? new GameCollection( response.ownedCollection )
	// 		: undefined;
	// 	this.recommendedCollection = response.recommendedCollection
	// 		? new GameCollection( response.recommendedCollection )
	// 		: undefined;
	// 	this.bundleCollections = GameCollection.populate( response.bundleCollections );

	// 	this.isBootstrapped = true;
	// 	console.log( 'resolve the bootstrap' );
	// 	bootstrapPromiseResolve();
	// }

	// private static clear()
	// {
	// 	this.collections = [];
	// 	this.followedCollection = undefined;
	// 	this.developerCollection = undefined;
	// 	this.ownedCollection = undefined;
	// 	this.recommendedCollection = undefined;
	// 	this.bundleCollections = [];
	// }
}
