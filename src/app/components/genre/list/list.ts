import { provide } from 'ng-metadata/core';
import { ListComponent } from './list-directive';

export default angular.module( 'App.Genre.List', [] )
.directive( ...provide( ListComponent ) )
.name;
