import { Injectable, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';

import { Search } from '../../components/search/search-service';

@Injectable()
export class SearchCtrl {
	query: string;
	showPagination = false;
	noResults = false;
	payload: any = undefined;

	constructor(@Inject('$state') private $state: StateService, @Inject('$scope') $scope: ng.IScope) {
		$scope['Search'] = Search;

		// We store our own version of the search query and sync back to it on form submission.
		this.query = Search.query;
	}

	onSearchSubmitted() {
		Search.query = this.query;
		this.$state.go('search.results', { q: Search.query });
	}

	onSearchBlurred() {
		// Somewhat fragile, but basically the autocompleter may be transitioning them.
		// If we aren't transitioning then submit the search.
		if (!this.$state.transition) {
			this.onSearchSubmitted();
		}
	}
}
