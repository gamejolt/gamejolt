import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./media.component.html';

import { Meta } from '../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Clipboard } from '../../../../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { GameSketchfab } from '../../../../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Loader } from '../../../../../../../../lib/gj-lib-client/components/loader/loader.service';
import { Game } from '../../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Environment } from '../../../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { GameVideo } from '../../../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameScreenshot } from '../../../../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';

/**
 * Note that we modify media items in place.
 * This is bad, but we can refactor it out to events later, perhaps.
 * Some sort of redux pattern would be great here.
 */
@Component({
	selector: 'route-dash-dev-games-manage-game-media',
	template,
})
export class RouteMediaComponent implements OnInit
{
	@Input() payload: any;

	@Input() game: Game;
	@Input() isWizard: boolean;
	@Input() mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[];

	addTab: 'image' | 'video' | 'sketchfab' = 'image';
	activeItem: any = null;
	currentSort: string[] = [];

	Loader = Loader;
	Environment = Environment;
	clipboard = Clipboard;

	constructor(
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		Loader.load( 'ui-tree' );
	}

	ngOnInit()
	{
		Meta.title = this.gettextCatalog.getString( 'dash.games.media.page_title', {
			game: this.game.title,
		} );

		this.mediaItems.splice( 0, this.mediaItems.length );
		if ( this.payload.mediaItems && this.payload.mediaItems.length ) {
			this.payload.mediaItems.forEach( ( item: any ) =>
				this.mediaItems.push( this._instantiateMediaItem( item ) )
			);
		}
	}

	private _instantiateMediaItem( item: any )
	{
		if ( item.media_type == 'image' ) {
			return new GameScreenshot( item );
		}
		else if ( item.media_type == 'video' ) {
			return new GameVideo( item );
		}
		else if ( item.media_type == 'sketchfab' ) {
			return new GameSketchfab( item );
		}
		else {
			throw new Error( `Invalid media item type.` );
		}
	}

	onVideoAdded( video: any )
	{
		this.mediaItems.unshift( this._instantiateMediaItem( video ) );
		this.updateSort();
	}

	onSketchfabAdded( sketchfab: any )
	{
		this.mediaItems.unshift( this._instantiateMediaItem( sketchfab ) );
		this.updateSort();
	}

	onImagesAdded( response: any )
	{
		response.screenshots.forEach( ( image: any ) => this.mediaItems.unshift( this._instantiateMediaItem( image ) ) );
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
			Api.sendRequest( '/web/dash/developer/games/media/save-sort/' + this.game.id, newSort );
		}
	}

	async removeItem( item: any )
	{
		let typeLabel = '';
		if ( item.media_type == 'image' ) {
			typeLabel = this.gettextCatalog.getString( 'dash.games.media.image_label' ).toLowerCase();
		}
		else if ( item.media_type == 'video' ) {
			typeLabel = this.gettextCatalog.getString( 'dash.games.media.video_label' ).toLowerCase();
		}
		else if ( item.media_type == 'sketchfab' ) {
			typeLabel = this.gettextCatalog.getString( 'sketchfab model' ).toLowerCase();
		}

		/// {{ type }} contains the translated media item type (image/video/sketchfab)
		const message = this.gettextCatalog.getString( 'dash.games.media.remove_confirmation', { type: typeLabel } );

		await this.confirm.show( message );
		await item.$remove();

		_.remove( this.mediaItems, { id: item.id } );
		this.updateSort();
	};

	getSort()
	{
		return this.mediaItems.map( ( item: any ) =>
		{
			if ( item.media_type == 'image' ) {
				return 'screenshot-' + item.id;
			}
			else if ( item.media_type == 'video' ) {
				return 'video-' + item.id;
			}
			else if ( item.media_type == 'sketchfab' ) {
				return 'sketchfab-' + item.id;
			}
			else {
				throw new Error( `Invalid type.` );
			}
		} );
	}

	updateSort()
	{
		this.currentSort = this.getSort();
	}
}
