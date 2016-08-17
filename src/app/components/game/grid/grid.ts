import { provide } from 'ng-metadata/core';
import { GridComponent } from './grid-directive';

export default angular.module( 'App.Game.Grid', [] )
.directive( ...provide( GridComponent ) )
.name;
