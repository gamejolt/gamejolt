import { provide } from 'ng-metadata/core';
import { LearnCtrl } from './learn-controller';

export default angular.module( 'App.Views.Landing.Learn', [
] )
.controller( ...provide( 'Landing.LearnCtrl', { useClass: LearnCtrl } ) )
.name;
