import { Injectable, Inject } from 'ng-metadata/core';

import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { BroadcastModal } from '../broadcast-modal/broadcast-modal.service';
import { getProvider, lazyload } from '../../../lib/gj-lib-client/utils/utils';
import { App } from '../../app-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

@Injectable( 'Shell' )
export class Shell
{
	collections: any[];
	followedCollection?: any;
	developerCollection?: any;
	ownedCollection?: any;
	recommendedCollection?: any;
	bundleCollections: any[];

	isBootstrapped = false;
	bootstrapPromise: Promise<void>;
	private bootstrapPromiseResolve: ng.IQResolveReject<void>;

	private _isLeftPaneSticky = true;
	private _isLeftPaneOverlayed = false;
	private _isRightPaneOverlayed = false;

	private backdrop?: any;
	private chat?: any;

	constructor(
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
		@Inject( 'Backdrop' ) private Backdrop: any,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'GameCollection' ) private collectionModel: any,
		@Inject( 'Settings' ) private settings: any,
		@Inject( 'BroadcastModal' ) private broadcastModal: BroadcastModal,
		@Inject( 'hotkeys' ) private hotkeys: ng.hotkeys.HotkeysProvider,
	)
	{
		this.bootstrapPromise = new Promise<void>( ( resolve ) => this.bootstrapPromiseResolve = resolve );

		this._isLeftPaneSticky = this.settings.get( 'sidebar' );

		/**
		 * After changing states, hide all overlays.
		 */
		$rootScope.$on( '$stateChangeStart', () =>
		{
			// When navigating, only change the overlayed states.
			this._isLeftPaneOverlayed = false;
			this._isRightPaneOverlayed = false;
			this.checkBackdrop();
		} );

		hotkeys.add( {
			combo: 'm',
			description: 'Toggle the sidebar menu.',
			callback: () => this.toggleLeftPane(),
		} );

		$rootScope.$watch( () => !!getProvider<App>( 'App' ).user, ( isLoggedIn ) =>
		{
			if ( isLoggedIn ) {
				this.bootstrap();
			}
			else {
				this.clear();
			}

			if ( isLoggedIn ) {
				require.ensure( [], () => lazyload( () =>
				{
					require( '../chat/chat.module' );
				} ), 'chat' )
				.then( () =>
				{
					// Connect to chat.
					this.chat = getProvider<any>( 'Chat' );
					this.chat.connect();

					hotkeys.add( {
						combo: 'c',
						description: 'Toggle the chat.',
						callback: () => this.toggleRightPane(),
					} );
				} );
			}
			else {
				// Log out of chat. This will notify other tabs to disconnect from the server too.
				if ( this.chat ) {
					if ( this.chat.client ) {
						this.chat.client.logOut();
					}
					this.hotkeys.del( 'c' );
				}

				this.chat = undefined;
			}
		} );
	}

	get isLeftPaneVisible()
	{
		if ( this.screen.isDesktop ) {
			return this._isLeftPaneSticky;
		}

		return this._isLeftPaneOverlayed;
	}

	get isRightPaneVisible()
	{
		return this._isRightPaneOverlayed;
	}

	toggleLeftPane()
	{
		if ( this.screen.isDesktop ) {
			this._isLeftPaneSticky = !this._isLeftPaneSticky;
		}
		else {
			this._isLeftPaneOverlayed = !this._isLeftPaneOverlayed;
		}

		this._isRightPaneOverlayed = false;
		this.checkBackdrop();
		this.settings.set( 'sidebar', this._isLeftPaneSticky );

		return this;
	}

	toggleRightPane()
	{
		this._isRightPaneOverlayed = !this._isRightPaneOverlayed;
		this._isLeftPaneOverlayed = false;
		this.checkBackdrop();

		return this;
	}

	private shouldShowLeftPaneBackdrop()
	{
		return this._isLeftPaneOverlayed && this.screen.isMobile;
	}

	private checkBackdrop()
	{
		// Ensure we have a backdrop if anything is overlayed.
		// Otherwise ensure the backdrop is gone.
		if ( this._isRightPaneOverlayed || this.shouldShowLeftPaneBackdrop() ) {
			if ( this.backdrop ) {
				return;
			}

			this.backdrop = new this.Backdrop(
				angular.element( document.getElementById( 'shell-body' ) as HTMLElement )
			);

			this.backdrop.onCloseTrigger = () =>
			{
				// If they clicked the backdrop or something, close all overlayed panes.
				this._isLeftPaneOverlayed = false;
				this._isRightPaneOverlayed = false;
				this.destroyBackdrop();
			};
		}
		else if ( this.backdrop ) {
			this.destroyBackdrop();
		}
	}

	private destroyBackdrop()
	{
		this.backdrop.remove();
		this.backdrop = undefined;
	}

	private bootstrap()
	{
		Api.sendRequest( '/web/library' )
			.then( ( response: any ) =>
			{
				this.collections = this.collectionModel.populate( response.collections );
				this.followedCollection = response.followedCollection
					? new this.collectionModel( response.followedCollection )
					: null;
				this.developerCollection = response.developerCollection
					? new this.collectionModel( response.developerCollection )
					: null;
				this.ownedCollection = response.ownedCollection
					? new this.collectionModel( response.ownedCollection )
					: null;
				this.recommendedCollection = response.recommendedCollection
					? new this.collectionModel( response.recommendedCollection )
					: null;
				this.bundleCollections = this.collectionModel.populate( response.bundleCollections );

				this.isBootstrapped = true;
				this.bootstrapPromiseResolve();
			} );

		this.broadcastModal.check();
	}

	private clear()
	{
		this.collections = [];
		this.followedCollection = undefined;
		this.developerCollection = undefined;
		this.ownedCollection = undefined;
		this.recommendedCollection = undefined;
		this.bundleCollections = [];
	}
}
