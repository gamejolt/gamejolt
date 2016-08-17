import { provide } from 'ng-metadata/core';
import { DetailsCtrl } from './details-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Details', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.DetailsCtrl', { useClass: DetailsCtrl } ) )
.name;
