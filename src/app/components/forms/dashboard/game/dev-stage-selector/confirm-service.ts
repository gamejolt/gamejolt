import { Injectable, Inject } from 'ng-metadata/core';
import template from 'html!./confirm.html';

@Injectable()
export class FormDashboardGameDevStageSelectorConfirm
{
	constructor(
		@Inject( '$modal' ) private $modal: any
	)
	{
	}

	show( game: any, stage: number ): ng.IPromise<void>
	{
		const modalInstance = this.$modal.open( {
			template,
			size: 'sm',
			controller: 'Form.Dashboard.Game.DevStageSelectorConfirmCtrl',
			controllerAs: '$ctrl',
			resolve: {
				game: () => game,
				stage: () => stage,
			},
		} );

		return modalInstance.result;
	}
}
