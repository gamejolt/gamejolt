import { Component, Inject } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./history.html';

import { SearchHistory } from './history-service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';

@Component({
	selector: 'gj-search-history',
	template,
})
export class SearchHistoryComponent
{
	isVisible = false;
	recentSearches: string[] = [];

	constructor(
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'SearchHistory' ) private searchHistory: SearchHistory,
		@Inject( 'Popover' ) private popover: Popover,
	)
	{
	}

	refresh()
	{
		this.recentSearches = this.searchHistory.get();
	}

	onShow()
	{
		this.isVisible = true;
		this.refresh();
	}

	onHide()
	{
		this.isVisible = false;
	}

	go( query: string )
	{
		this.$state.go( 'search.results', { q: query } );
		this.popover.hideAll();
	}

	clear()
	{
		this.searchHistory.clear();
		this.popover.hideAll();
	}
}
