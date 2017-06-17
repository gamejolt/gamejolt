import { provide } from 'ng-metadata/core';
import { WizardFinishCtrl } from './wizard-finish-controller';

export default angular
	.module('App.Views.Dashboard.Developer.Games.Manage.Game.WizardFinish', [])
	.controller(
		...provide('Dashboard.Developer.Games.Manage.Game.WizardFinishCtrl', {
			useClass: WizardFinishCtrl,
		}),
	).name;
