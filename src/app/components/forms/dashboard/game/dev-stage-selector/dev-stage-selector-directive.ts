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
		this.confirm.show( this.game, stage )
			.then( () =>
			{
				this.game.$setDevStage( stage );
			} );
	}
}
