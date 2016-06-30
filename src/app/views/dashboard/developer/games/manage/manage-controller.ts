import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class ManageCtrl
{
	game: any;
	isWizard: boolean;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Growls' ) private Growls: any,
		@Inject( 'ModalConfirm' ) private ModalConfirm: any,
		@Inject( 'Game' ) Game: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'managePayload' ) managePayload: any
	)
	{
		$scope['Game'] = Game;

		this.game = new Game( managePayload.game );
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

		return true;
	}

	removeGame()
	{
		this.ModalConfirm.show( this.gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( _ =>
			{
				return this.game.$remove();
			} )
			.then( _ =>
			{
				this.Growls.success(
					this.gettextCatalog.getString( 'dash.games.removed_growl' ),
					this.gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				this.$state.go( 'dashboard.main.overview' );
			} );
	}
}
