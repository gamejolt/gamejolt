import { provide } from 'ng-metadata/core';
import { InputDirective } from './input-directive';

export default angular.module( 'App.Search.Input', [] )
.directive( ...provide( InputDirective ) )
.name;
