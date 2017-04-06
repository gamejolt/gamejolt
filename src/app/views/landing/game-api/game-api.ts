import { provide } from 'ng-metadata/core';
import { GameApiCtrl } from './game-api-controller';

export default angular.module( 'App.Views.Landing.GameApi', [
] )
.controller( ...provide( 'Landing.GameApiCtrl', { useClass: GameApiCtrl } ) )
.name;
