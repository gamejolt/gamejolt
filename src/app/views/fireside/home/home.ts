import { provide } from 'ng-metadata/core';
import { HomeCtrl } from './home-controller';

export default angular.module( 'App.Views.Fireside.Home', [
] )
.controller( ...provide( 'Fireside.HomeCtrl', { useClass: HomeCtrl } ) )
.name;
