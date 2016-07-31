import { provide } from 'ng-metadata/core';
import { DevlogsCtrl } from './devlogs-controller';

export default angular.module( 'App.Views.Landing.Devlogs', [
] )
.controller( ...provide( 'Landing.DevlogsCtrl', { useClass: DevlogsCtrl } ) )
.name;
