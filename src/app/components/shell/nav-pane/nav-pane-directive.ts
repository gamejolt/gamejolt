import { Component, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Connection } from './../../../../lib/gj-lib-client/components/connection/connection-service.ts';
import template from 'html!./nav-pane.html';

@Component({
	selector: 'gj-shell-nav-pane',
	template,
})
export class NavPaneComponent
{
	// collections: any[];
	// followedCollection: any;
	// developerCollection: any;
	// ownedCollection: any;
	// bundleCollections: any[];

	// playlistFilterQuery = '';
	// playlistFilterComparator: ( item: any ) => boolean;

	constructor(
		@Inject( '$state' ) public $state: ng.ui.IStateService,
		@Inject( '$window' ) $window: ng.IWindowService,
		@Inject( '$timeout' ) $timeout: ng.ITimeoutService,
		@Inject( 'App' ) public app: App,
		@Inject( 'Environment' ) public env: any,
		@Inject( 'Connection' ) public connection: Connection,
		@Inject( 'Scroll' ) scroll: any,
		// @Inject( 'Api' ) api: any,
		// @Inject( 'GameCollection' ) private collectionModel: any,
		// @Inject( 'GamePlaylist_SaveModal' ) private playlistSaveModal: any,
	)
	{
		$timeout( () =>
		{
			// We have to set the scroll offset so that it knows that we have a fixed navbar.
			const elem = $window.document.getElementById( 'shell-body' );
			if ( elem ) {
				scroll.setOffsetTop( parseInt( $window.getComputedStyle( elem ).marginTop || '', 10 ) );
			}
		} );

		// api.sendRequest( '/web/library' )
		// 	.then( ( response: any ) =>
		// 	{
		// 		this.collections = collectionModel.populate( response.collections );
		// 		this.followedCollection = response.followedCollection ? new collectionModel( response.followedCollection ) : null;
		// 		this.developerCollection = response.developerCollection ? new collectionModel( response.developerCollection ) : null;
		// 		this.ownedCollection = response.ownedCollection ? new collectionModel( response.ownedCollection ) : null;
		// 		this.bundleCollections = collectionModel.populate( response.bundleCollections );
		// 	} );

		/**
		 * We compare the collection's name or owner's name if it's a subscription.
		 * This way they can search for "cros" and get cros's games if they're following.
		 */
		// this.playlistFilterComparator = ( item: any ) =>
		// {
		// 	let actual: string;
		// 	const expected = this.playlistFilterQuery.toLowerCase();

		// 	actual = item.name.toLowerCase();
		// 	if ( actual.indexOf( expected ) !== -1 ) {
		// 		return true;
		// 	}

		// 	if ( item.from_subscription ) {
		// 		actual = item.owner.display_name.toLowerCase();
		// 		if ( actual.indexOf( expected ) !== -1 ) {
		// 			return true;
		// 		}
		// 	}

		// 	return false;
		// };
	}

	// showAddPlaylistModal()
	// {
	// 	this.playlistSaveModal.show().then( ( response: any ) =>
	// 	{
	// 		const collection = new this.collectionModel( response.gameCollection );
	// 		this.collections.push( collection );

	// 		this.$state.go( collection.getSref(), collection.getSrefParams() );
	// 	} );
	// }
}
