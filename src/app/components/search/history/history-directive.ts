import { Component, Inject } from 'ng-metadata/core';
import template from 'html!./history.html';

import { Search_History } from './history-service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';

@Component({
	selector: 'gj-search-history',
	template,
})
export class HistoryComponent
{
	isVisible = false;
	recentSearches: string[] = [];

	constructor(
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( 'Search_History' ) private searchHistory: Search_History,
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

		// Give us time to render ourselves before showing.
		return this.$timeout( angular.noop );
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
