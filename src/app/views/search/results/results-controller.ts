import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Search } from './../../../components/search/search-service';
import { Search_History } from './../../../components/search/history/history-service';
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
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Search' ) search: Search,
		@Inject( 'Search_History' ) history: Search_History,
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

		app.title = gettextCatalog.getString( 'search.results.page_title', { query: $stateParams['q'] } );

		searchCtrl.query = $stateParams['q'];

		// We sync the query to the search service so that all places get updated with the new query.
		// We also record the search history since it was an explicit search request.
		search.query = searchCtrl.query;
		history.record( searchCtrl.query );

		searchCtrl.payload = payload;
		searchCtrl.showPagination = searchCtrl.payload.type != 'all';

		if ( !payload.gamesCount && !payload.usersCount && !payload.devlogsCount ) {
			searchCtrl.noResults = true;
		}
		else {
			if ( payload.devlogsCount > 0 ) {
				searchCtrl.payload.devlogsMobile = payload.devlogs.slice( 0, 3 );
				searchCtrl.payload.devlogsDesktop = payload.devlogs.slice( 0, 4 );
			}
		}
	}
}
