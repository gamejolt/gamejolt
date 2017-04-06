import { provide } from 'ng-metadata/core';
import { MusicCtrl } from './music-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Music', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.MusicCtrl', { useClass: MusicCtrl } ) )
.name;
