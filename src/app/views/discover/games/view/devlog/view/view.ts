import { provide } from 'ng-metadata/core';
import { ViewCtrl } from './view-controller';

export default angular.module( 'App.Views.Discover.Games.View.Devlog.View', [
] )
.controller( ...provide( 'Discover.Games.View.Devlog.ViewCtrl', { useClass: ViewCtrl } ) )
.name;
