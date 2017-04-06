import { provide } from 'ng-metadata/core';
import { AboutCtrl } from './about-controller';

export default angular.module( 'App.Views.Landing.About', [
] )
.controller( ...provide( 'Landing.AboutCtrl', { useClass: AboutCtrl } ) )
.name;
