import { provide } from 'ng-metadata/core';
import { Search_History } from './history-service';
import { HistoryComponent } from './history-directive';

export default angular.module( 'App.Search.History', [] )
.directive( ...provide( HistoryComponent ) )
.service( ...provide( 'Search_History', { useClass: Search_History } ) )
.name;
