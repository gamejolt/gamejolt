import { Directive, Inject, SkipSelf, Self, OnInit, HostListener } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';

import { Search } from '../search-service';
import { SearchHistory } from '../history/history-service';
import { SearchComponent } from '../search-directive';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

@Directive({
	selector: '[gj-search-input]',
})
export class SearchInputDirective implements OnInit
{
	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'Search' ) private search: Search,
		@Inject( 'SearchHistory' ) private searchHistory: SearchHistory,
		@Inject( 'Popover' ) private popoverService: Popover,
		@Inject( SearchComponent ) @SkipSelf() private searchCtrl: SearchComponent,
		@Inject( 'ngModel' ) @Self() private ngModel: ng.INgModelController
	)
	{
	}

	@HostListener( 'focus' )
	onFocus()
	{
		this.searchCtrl.isFocused = true;
		this.toggleAutocomplete( true );
	}

	@HostListener( 'blur' )
	onBlur()
	{
		this.searchCtrl.isFocused = false;
	}

	@HostListener( 'keydown', [ '$event' ] )
	onKeydown( event: JQueryEventObject )
	{
		// This stops the default behavior from happening when we press up/down
		// or enter (we don't want to submit form).
		if ( event.keyCode == KEYCODE_ESC
			|| event.keyCode == KEYCODE_UP
			|| event.keyCode == KEYCODE_DOWN
			|| event.keyCode == KEYCODE_ENTER
		) {
			event.preventDefault();
		}

		// If autocomplete is disabled, then we want to submit the form on enter.
		// Normally the autocomplete will take control of the submission since they
		// technically highlight what they want in autocomplete and go to it.
		if ( this.searchCtrl.autocompleteDisabled && event.keyCode == KEYCODE_ENTER ) {
			this.searchHistory.record( this.searchCtrl.query );
			this.$state.go( 'search.results', { q: this.searchCtrl.query } );
		}

		// We want to blur the input on escape.
		if ( event.keyCode == KEYCODE_ESC ) {
			this.searchCtrl.blur();
			this.toggleAutocomplete( false );
			event.stopPropagation();
		}

		// Let our parent know that a keydown event happened.
		this.searchCtrl.onKeydown( event );
	}

	ngOnInit()
	{
		this.searchCtrl.inputElem = this.$element;

		// Obviously don't want browser autocomplete popping over.
		const element = this.$element[0] as HTMLInputElement;
		element.autocomplete = 'off';

		// Sync from the global search query to our input.
		this.$scope.$watch( () => this.search.query, () =>
		{
			this.ngModel.$setViewValue( this.search.query );
			this.ngModel.$render();
		} );
	}

	private toggleAutocomplete( state: boolean )
	{
		const autocomplete = this.popoverService.getPopover( 'search-autocomplete' );
		if ( !autocomplete ) {
			return;
		}

		if ( state ) {
			autocomplete.show( this.$element );
		}
		else {
			autocomplete.hide();
		}
	}
}
