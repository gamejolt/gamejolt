import { provide } from 'ng-metadata/core';
import { SettingsCtrl } from './settings-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Settings', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.SettingsCtrl', { useClass: SettingsCtrl } ) )
.name;
