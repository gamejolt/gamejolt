import { provide } from 'ng-metadata/core';
import { MediaCtrl } from './media-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Media', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.MediaCtrl', { useClass: MediaCtrl } ) )
.name;
