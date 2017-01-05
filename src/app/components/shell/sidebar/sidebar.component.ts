import { Component, Inject, OnInit } from 'ng-metadata/core';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Shell } from '../shell-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { App } from '../../../app-service';
import template from 'html!./sidebar.component.html';

@Component({
	selector: 'gj-shell-sidebar',
	template,
})
export class ShellSidebarComponent implements OnInit
{
	playlistFilterQuery = '';
	playlistFilterComparator: Function;

	channels = [
		'horror',
		'multiplayer',
		'retro',
		'survival',
		'fangame',
		'fnaf',
	];

	genres = {
		'action': 'Action',
		'adventure': 'Adventure',
		'arcade': 'Arcade',
		'platformer': 'Platformer',
		'puzzle': 'Puzzle',
		'rpg': 'RPG',
		'shooter': 'Shooter',
		'sports': 'Sports',
		'strategy-sim': 'Strategy/Sim',
		'other': 'Other',
	};

	constructor(
		@Inject( '$state' ) public $state: ng.ui.IStateService,
		@Inject( 'Environment' ) public env: Environment,
		@Inject( 'Shell' ) public shell: Shell,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'App' ) public app: App,
		@Inject( 'GameCollection' ) private collectionModel: any,
		@Inject( 'GamePlaylist_SaveModal' ) private playlistModal: any,
	)
	{
	}

	ngOnInit()
	{
		this.playlistFilterComparator = ( item: any ) => this._playlistFilterComparator( item );
	}

	// Show hot when logged in, otherwise default to best.
	get defaultBrowseSection()
	{
		return this.app.user ? 'hot' : 'best';
	}

	showAddPlaylistModal()
	{
		this.playlistModal.show()
			.then( ( response: any ) =>
			{
				const collection = new this.collectionModel( response.gameCollection );
				this.shell.collections.push( collection );
				this.$state.go( collection.getSref(), collection.getSrefParams() );
			} );
	}

	/**
	 * We compare the collection's name or owner's name if it's a subscription.
	 * This way they can search for "cros" and get cros's games if they're following.
	 */
	_playlistFilterComparator( item: any )
	{
		let actual: string;
		let expected = this.playlistFilterQuery.toLowerCase();

		actual = item.name.toLowerCase();
		if ( actual.indexOf( expected ) !== -1 ) {
			return true;
		}

		if ( item.from_subscription ) {
			actual = item.owner.username.toLowerCase();
			if ( actual.indexOf( expected ) !== -1 ) {
				return true;
			}
		}

		return false;
	}
}
