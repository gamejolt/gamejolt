import { Injectable, Inject } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';

import { App } from '../../../app-service';
import { Search } from '../../../components/search/search-service';
import { SearchHistory } from '../../../components/search/history/history-service';
import { SearchCtrl } from '../search-controller';

interface Scope extends ng.IScope {
	searchCtrl: SearchCtrl;
}

@Injectable()
export class ResultsCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: Scope,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( '$stateParams' ) $stateParams: StateParams,
		@Inject( 'payload' ) payload: any,
	)
	{
		const searchCtrl = $scope.searchCtrl;

		searchCtrl.query = '';
		searchCtrl.showPagination = false;
		searchCtrl.payload = {};
		searchCtrl.noResults = false;

		if ( !$stateParams['q'] ) {
			app.title = gettextCatalog.getString( 'search.page_title' );
			return;
		}

		app.title = gettextCatalog.getString( 'Search results for {{ query }}', { query: $stateParams['q'] } );

		searchCtrl.query = $stateParams['q'];

		// We sync the query to the search service so that all places get updated with the new query.
		// We also record the search history since it was an explicit search request.
		Search.query = searchCtrl.query;
		SearchHistory.record( searchCtrl.query );

		searchCtrl.payload = payload;
		searchCtrl.showPagination = searchCtrl.payload.type != 'all';

		if ( !payload.gamesCount && !payload.usersCount && !payload.devlogsCount ) {
			searchCtrl.noResults = true;
		}
		else {
			if ( payload.devlogsCount > 0 ) {
				searchCtrl.payload.devlogsTrimmed = payload.devlogs.slice( 0, 4 );
			}
		}
	}
}
