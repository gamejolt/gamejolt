import { Component, Inject, Input } from 'ng-metadata/core';
import { FormDashboardGameDevStageSelectorConfirm } from './confirm-service';
import template from 'html!./dev-stage-selector.html';

@Component({
	selector: 'gj-form-dashboard-game-dev-stage-selector',
	template,
})
export class DevStageSelectorComponent
{
	@Input( '<' ) game: any;

	constructor(
		@Inject( 'Game' ) public gameModel: any,
		@Inject( 'FormDashboardGameDevStageSelectorConfirm' ) private confirm: FormDashboardGameDevStageSelectorConfirm
	)
	{
	}

	select( stage: number )
	{
		if ( !this.isEnabled( stage ) || stage == this.game.development_status ) {
			return;
		}

		this.confirm.show( this.game, stage )
			.then( () =>
			{
				this.game.$setDevStage( stage );
			} );
	}

	isEnabled( stage: number )
	{
		if ( (stage == this.gameModel.DEVELOPMENT_STATUS_WIP || stage == this.gameModel.DEVELOPMENT_STATUS_FINISHED) && !this.game.has_active_builds ) {
			return false;
		}
		return true;
	}
}
