import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import { StateService, Transition } from 'angular-ui-router';
import * as template from '!html-loader!./manage.component.html';

import { ModalConfirm } from '../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { MediaItem } from '../../../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { attachProvidersApp } from '../../../../../app-service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'route-dash-dev-games-manage',
	template,
})
export class RouteManageComponent implements OnInit
{
	@Input() managePayload: any;
	@Input() $transition$: Transition;

	game: Game;
	isWizard: boolean;
	mediaItems: MediaItem[] = [];

	Game = Game;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) public $state: StateService,
		@Inject( 'ModalConfirm' ) private modalConfirm: ModalConfirm,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		// For back-compat.
		$scope['manageCtrl'] = this;
		attachProvidersApp( $scope );
	}

	ngOnInit()
	{
		this.game = new Game( this.managePayload.game );
		this.isWizard = !!this.$transition$.params()['wizard'];
	}

	get canPublish()
	{
		if ( !this.game.description_markdown ) {
			return false;
		}
		else if ( !this.game.thumbnail_media_item ) {
			return false;
		}
		else if ( !this.game.tigrs_age ) {
			return false;
		}
		else if ( !this.game._is_devlog && !this.game.has_active_builds ) {
			return false;
		}

		return true;
	}

	publish()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'dash.games.overview.publish_confirmation' ) )
			.then( () => this.game.$setStatus( Game.STATUS_VISIBLE ) )
			.then( () =>
			{
				Growls.success(
					this.gettextCatalog.getString( 'dash.games.overview.published_growl' ),
					this.gettextCatalog.getString( 'dash.games.overview.published_growl_title' )
				);
				this.$state.go( 'dashboard.developer.games.manage.game.overview', { wizard: null } );
			} );
	}

	saveDraft()
	{
		// Simply go to the overview and pull out of the wizard!
		this.$state.go( 'dashboard.developer.games.manage.game.overview', { wizard: null } );
	}

	hide()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'Are you sure you want to hide your game page?' ) )
			.then( () => this.game.$setStatus( Game.STATUS_HIDDEN ) )
			.then( () =>
			{
				Growls.info(
					this.gettextCatalog.getString( 'Your game page is now hidden.' ),
					this.gettextCatalog.getString( 'Game Hidden' )
				);
			} );
	}

	cancel()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'Are you sure you want to cancel your game?' ) )
			.then( () => this.game.$setCanceled( true ) )
			.then( () =>
			{
				Growls.info(
					this.gettextCatalog.getString( 'Your game is now canceled.' ),
					this.gettextCatalog.getString( 'Game Canceled' )
				);
			} );
	}

	uncancel()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'Are you sure you want to uncancel your game?' ) )
			.then( () => this.game.$setCanceled( false ) )
			.then( () =>
			{
				Growls.info(
					this.gettextCatalog.getString( 'Your game is no longer canceled.' ),
					this.gettextCatalog.getString( 'Game Uncanceled' )
				);
			} );
	}

	removeGame()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( () => this.game.$remove() )
			.then( () =>
			{
				Growls.info(
					this.gettextCatalog.getString( 'dash.games.removed_growl' ),
					this.gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				this.$state.go( 'dashboard.main.overview' );
			} );
	}
}
