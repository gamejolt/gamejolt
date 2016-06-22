import { Directive, Inject, SkipSelf, Self, OnInit } from 'ng-metadata/core';
import { Search } from './../search-service';
import { Search_History } from './../history/history-service';
import { SearchComponent } from './../search-directive';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

@Directive({
	selector: '[gj-search-input]',
})
export class InputDirective implements OnInit
{
	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( 'Search' ) private search: Search,
		@Inject( 'Search_History' ) private searchHistory: Search_History,

		@Inject( SearchComponent ) @SkipSelf() private searchCtrl: SearchComponent,
		@Inject( 'ngModel' ) @Self() private ngModel: ng.INgModelController
	)
	{
	}

	ngOnInit()
	{
		this.searchCtrl.inputElem = this.$element;

		// Obviouisly don't want browser autocomplete popping over.
		this.$element[0].autocomplete = 'off';

		// Sync from the global search query to our input.
		this.$scope.$watch( _ => this.search.query, _ =>
		{
			this.ngModel.$setViewValue( this.search.query );
			this.ngModel.$render();
		} );

		this.$element.on( 'focus', _ =>
		{
			this.$scope.$applyAsync( _ =>
			{
				this.searchCtrl.isFocused = true;
			} );
		} );

		this.$element.on( 'blur', _ =>
		{
			this.$scope.$applyAsync( _ =>
			{
				this.searchCtrl.isFocused = false;
			} );
		} );

		this.$element.on( 'keydown', ( event: KeyboardEvent ) =>
		{
			this.$scope.$applyAsync( _ =>
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
					event.stopPropagation();
				}

				// Let our parent know that a keydown event happened.
				this.searchCtrl.onKeydown( event );
			} );
		} );
	}
}
