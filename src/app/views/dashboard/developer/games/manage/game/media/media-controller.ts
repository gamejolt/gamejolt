import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { ModalConfirm } from './../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Permalink } from './../../../../../../../../lib/gj-lib-client/components/permalink/permalink-service';

@Injectable()
export class MediaCtrl
{
	// mediaItems: any[] = [];
	$manageCtrl: any = null;
	addTab: 'image' | 'video' = 'image';
	activeItem: any = null;
	currentSort: string[] = null;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Game_Screenshot' ) private gameScreenshotModel: any,
		@Inject( 'Game_Video' ) private gameVideoModel: any,
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
		@Inject( 'Permalink' ) private permalink: Permalink,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		this.$manageCtrl = this.$scope['manageCtrl'];

		app.title = gettextCatalog.getString( 'dash.games.media.page_title', { game: this.$manageCtrl.game.title } );

		this.$manageCtrl.mediaItems = [];
		if ( payload.mediaItems && payload.mediaItems.length ) {
			payload.mediaItems.forEach( item => this.$manageCtrl.mediaItems.push( this._instantiateMediaItem( item ) ) );
		}
	}

	private _instantiateMediaItem( item )
	{
		if ( item.media_type == 'image' ) {
			return new this.gameScreenshotModel( item );
		}
		else if ( item.media_type == 'video' ) {
			return new this.gameVideoModel( item );
		}
	}

	onVideoAdded( video )
	{
		this.$manageCtrl.mediaItems.unshift( this._instantiateMediaItem( video ) );
		this.updateSort();
		this.addTab = 'image';
	}

	onImagesAdded( response )
	{
		response.screenshots.forEach( image => this.$manageCtrl.mediaItems.unshift( this._instantiateMediaItem( image ) ) );
		this.updateSort();
	}

	onMediaEdited()
	{
		this.activeItem = null;
	}

	// Needed for the closure since ui-tree ruins the "this" context.
	_onMediaSorted = () => this.onMediaSorted();

	onMediaSorted()
	{
		const newSort = this.getSort();

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, this.currentSort ) ) {

			// Save off the sort.
			this.currentSort = newSort;
			this.api.sendRequest( '/web/dash/developer/games/media/save-sort/' + this.$scope['manageCtrl'].game.id, newSort );
		}
	}

	removeItem( item )
	{
		let typeLabel;
		if ( item.media_type == 'image' ) {
			typeLabel = this.gettextCatalog.getString( 'dash.games.media.image_label' ).toLowerCase();
		}
		else if ( item.media_type == 'video' ) {
			typeLabel = this.gettextCatalog.getString( 'dash.games.media.video_label' ).toLowerCase();
		}

		/// {{ type }} contains the translated media item type (image/video)
		const message = this.gettextCatalog.getString( 'dash.games.media.remove_confirmation', { type: typeLabel } );

		this.confirm.show( message )
			.then( _ =>
			{
				return item.$remove();
			} )
			.then( _ =>
			{
				window._.remove( this.$manageCtrl.mediaItems, { id: item.id } );
				this.updateSort();
			} );
	};

	getSort()
	{
		return this.$manageCtrl.mediaItems.map( item =>
		{
			if ( item.media_type == 'image' ) {
				return 'screenshot-' + item.id;
			}
			else if ( item.media_type == 'video' ) {
				return 'video-' + item.id;
			}
		} );
	}

	updateSort()
	{
		this.currentSort = this.getSort();
	}
}
