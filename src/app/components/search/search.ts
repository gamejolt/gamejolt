import { provide } from 'ng-metadata/core';
import { SearchPayloadFactory } from './payload-service';
import { Search } from './search-service';
import { SearchComponent } from './search-directive';

import HistoryModule from './history/history';
import AutocompleteModule from './autocomplete/autocomplete';
import InputModule from './input/input';

export default angular.module( 'App.Search', [
	HistoryModule,
	AutocompleteModule,
	InputModule,
] )
.factory( 'SearchPayload', SearchPayloadFactory )
.service( ...provide( 'Search', { useClass: Search } ) )
.directive( ...provide( SearchComponent ) )
.name;
