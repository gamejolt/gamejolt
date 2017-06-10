import { provide } from 'ng-metadata/core';
import { MaturityCtrl } from './maturity-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Maturity', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.MaturityCtrl', { useClass: MaturityCtrl } ) )
.name;
