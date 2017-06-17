import { provide } from 'ng-metadata/core';
import { DevStageSelectorComponent } from './dev-stage-selector-directive';
import { FormDashboardGameDevStageSelectorConfirm } from './confirm-service';
import { ModalCtrl } from './confirm-controller';

export default angular
	.module('App.Forms.Dashboard.Game.DevStageSelector', [])
	.directive(...provide(DevStageSelectorComponent))
	.service(
		...provide('FormDashboardGameDevStageSelectorConfirm', {
			useClass: FormDashboardGameDevStageSelectorConfirm,
		}),
	)
	.controller(
		...provide('Form.Dashboard.Game.DevStageSelectorConfirmCtrl', {
			useClass: ModalCtrl,
		}),
	).name;
