import { provide } from 'ng-metadata/core';
import { GameApiDocCtrl } from './game-api-doc-controller';

export default angular.module( 'App.Views.Landing.GameApiDoc', [
] )
.controller( ...provide( 'Landing.GameApiDocCtrl', { useClass: GameApiDocCtrl } ) )
.name;
