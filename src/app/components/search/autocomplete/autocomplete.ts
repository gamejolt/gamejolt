import { provide } from 'ng-metadata/core';
import { AutocompleteComponent } from './autocomplete-directive';

export default angular.module( 'App.Search.Autocomplete', [] )
.directive( ...provide( AutocompleteComponent ) )
.name;
