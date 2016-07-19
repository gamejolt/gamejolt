import { Injectable, Inject } from 'ng-metadata/core';
import { ModalConfirm } from './../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { App } from './../../../../../../../app-service';

@Injectable()
export class MusicCtrl
{
	songs: any[];
	isAdding = false;
	activeItem: any = null;
	currentSort: number[] = null;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Game_Song' ) private gameSongModel: any,
		@Inject( 'ModalConfirm' ) private modalConfirm: ModalConfirm,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'dash.games.music.page_title', { game: $scope['manageCtrl'].game.title } );

		this.songs = gameSongModel.populate( payload.songs );
	}

	onSongEdited()
	{
		this.activeItem = null;
	}

	onSongAdded( formModel )
	{
		this.songs.push( new this.gameSongModel( formModel ) );
		this.isAdding = false;
		this.updateSort();
	}

	onSongsSorted()
	{
		var newSort = _.pluck( this.songs, 'id' );

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, this.currentSort ) ) {

			// Save off the sort.
			this.currentSort = newSort;
			this.gameSongModel.$saveSort( this.$scope['manageCtrl'].game.id, newSort );
		}
	}

	removeSong( song )
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'dash.games.music.remove_confirmation' ) )
			.then( () =>
			{
				return song.$remove();
			} )
			.then( () =>
			{
				_.remove( this.songs, { id: song.id } );
				this.updateSort();
			} );
	}

	updateSort()
	{
		this.currentSort = _.pluck( this.songs, 'id' );
	}
}
