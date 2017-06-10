import { Injectable, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./confirm.html';

@Injectable( 'FormDashboardGameDevStageSelectorConfirm' )
export class FormDashboardGameDevStageSelectorConfirm
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( game: any, stage: number ): Promise<void>
	{
		const modalInstance = this.$modal.open( {
			template,
			size: 'sm',
			controller: 'Form.Dashboard.Game.DevStageSelectorConfirmCtrl',
			controllerAs: ',
			resolve: {
				game: () => game,
				stage: () => stage,
			},
		} );

		return modalInstance.result;
	}
}
