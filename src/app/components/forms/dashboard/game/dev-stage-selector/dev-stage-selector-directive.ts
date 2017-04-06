import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { FormDashboardGameDevStageSelectorConfirm } from './confirm-service';
import template from 'html!./dev-stage-selector.html';

@Component({
	selector: 'gj-form-dashboard-game-dev-stage-selector',
	template,
})
export class DevStageSelectorComponent
{
	@Input( '<?' ) game?: any;

	@Output( '?' ) onSelect?: Function;

	constructor(
		@Inject( 'Game' ) public gameModel: any,
		@Inject( 'FormDashboardGameDevStageSelectorConfirm' ) private confirm: FormDashboardGameDevStageSelectorConfirm,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
	}

	select( stage: number )
	{
		if ( this.onSelect ) {
			this.onSelect( { $stage: stage } );
		}

		if ( !this.isEnabled( stage ) || stage == this.game.development_status ) {
			return;
		}

		this.confirm.show( this.game, stage )
			.then( () => this.game.$setDevStage( stage ) )
			.then( () =>
			{
				this.growls.success(
					this.gettextCatalog.getString( "Your game's development stage has been changed!" ),
					this.gettextCatalog.getString( 'Stage Changed' ),
				);
			} );
	}

	isEnabled( stage: number )
	{
		if ( !this.game ) {
			return true;
		}

		if ( (stage == this.gameModel.DEVELOPMENT_STATUS_WIP || stage == this.gameModel.DEVELOPMENT_STATUS_FINISHED) && !this.game.has_active_builds ) {
			return false;
		}
		return true;
	}
}
