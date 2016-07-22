import { Injectable, Inject } from 'ng-metadata/core';
import { ModalConfirm } from './../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@Injectable()
export class ManageCtrl
{
	game: any;
	isWizard: boolean;
	mediaItems: any[] = [];

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'ModalConfirm' ) private modalConfirm: ModalConfirm,
		@Inject( 'Game' ) private gameModel: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'managePayload' ) managePayload: any
	)
	{
		$scope['Game'] = gameModel;

		this.game = new gameModel( managePayload.game );
		this.isWizard = !!$stateParams['wizard'];
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
			.then( () => this.game.$setStatus( this.gameModel.STATUS_VISIBLE ) )
			.then( () =>
			{
				this.growls.success(
					this.gettextCatalog.getString( 'dash.games.overview.published_growl' ),
					this.gettextCatalog.getString( 'dash.games.overview.published_growl_title' )
				);
			} );
	}

	saveDraft()
	{
		// Simply go to the overview and pull out of the wizard!
		this.$state.go( 'dashboard.developer.games.manage.game.overview', { wizard: null } );
	}

	removeGame()
	{
		this.modalConfirm.show( this.gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( () =>
			{
				return this.game.$remove();
			} )
			.then( () =>
			{
				this.growls.success(
					this.gettextCatalog.getString( 'dash.games.removed_growl' ),
					this.gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				this.$state.go( 'dashboard.main.overview' );
			} );
	}
}
