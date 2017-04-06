import { provide } from 'ng-metadata/core';
import { ResultsCtrl } from './results-controller';

export default angular.module( 'App.Views.Search.Results', [
] )
.controller( ...provide( 'Search.ResultsCtrl', { useClass: ResultsCtrl } ) )
.name;
