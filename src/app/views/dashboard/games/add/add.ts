import { provide } from 'ng-metadata/core';
import { AddCtrl } from './add-controller';

export default angular
	.module('App.Views.Dashboard.Developer.Games.Add', [])
	.controller(
		...provide('Dashboard.Developer.Games.AddCtrl', { useClass: AddCtrl })
	).name;
