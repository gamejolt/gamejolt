import { provide } from 'ng-metadata/core';
import { OverviewCtrl } from './overview-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Overview', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.OverviewCtrl', { useClass: OverviewCtrl } ) )
.name;
