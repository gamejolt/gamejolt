import { provide } from 'ng-metadata/core';
import { HeaderCtrl } from './header-controller';

export default angular.module( 'App.Views.Dashboard.Developer.Games.Manage.Game.Header', [
] )
.controller( ...provide( 'Dashboard.Developer.Games.Manage.Game.HeaderCtrl', { useClass: HeaderCtrl } ) )
.name;
