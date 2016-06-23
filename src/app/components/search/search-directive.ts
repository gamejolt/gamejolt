import { Component, Inject, Input } from 'ng-metadata/core';
import { Search } from './search-service';
import template from './search.html';

@Component({
	selector: 'gj-search',
	template,
})
export class SearchComponent
{
	static GLOBAL_ID = 0;

	id = ++SearchComponent.GLOBAL_ID;

	query: string;
	isFocused = false;
	inputElem: ng.IAugmentedJQuery = null;
	searchElem: ng.IAugmentedJQuery;
	keydownSpies: Function[] = [];

	@Input( '<?gjSearchAutocompleteDisable' ) autocompleteDisabled: boolean = false;

	constructor(
		@Inject( 'Search' ) search: Search,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( 'hotkeys' ) hotkeys: ng.hotkeys.HotkeysProvider
	)
	{
		this.query = search.query;
		this.searchElem = $element;

		hotkeys.bindTo( $scope )
			.add( {
				combo: 's',
				description: 'Focus the search bar.',
				callback: event =>
				{
					this.focus();
					event.preventDefault();
				}
			} );
	}

	isEmpty()
	{
		return !this.query.trim();
	}

	focus()
	{
		if ( this.inputElem ) {
			this.$timeout( () =>
			{
				this.inputElem[0].focus();
			} );
		}
	}

	blur()
	{
		if ( this.inputElem ) {
			this.$timeout( () =>
			{
				this.inputElem[0].blur();
			} );
		}
	}

	/**
	 * Ability to set watchers for when a keydown event fires.
	 */
	setKeydownSpy( fn: Function )
	{
		this.keydownSpies.push( fn );
	}

	onKeydown( event: Event )
	{
		for ( const spy of this.keydownSpies ) {
			spy( event );
		}
	}
}
