import { provide } from 'ng-metadata/core';
import { SearchCtrl } from './search-controller';
import Results from './results/results';

export default angular.module( 'App.Views.Search', [
	Results,
] )
.controller( ...provide( 'SearchCtrl', { useClass: SearchCtrl } ) )
.name;
