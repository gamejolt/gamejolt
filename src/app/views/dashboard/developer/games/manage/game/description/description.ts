import { provide } from 'ng-metadata/core';
import { DescriptionCtrl } from './description-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Description', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.DescriptionCtrl', { useClass: DescriptionCtrl } ) )
.name;
