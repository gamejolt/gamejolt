import { Component, Inject, Input, SkipSelf, OnInit } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Search } from './../search-service';
import { SearchComponent } from './../search-directive';
import { Search_History } from './../history/history-service';
import template from './autocomplete.html';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

interface CommandOptions
{
	section: string;
}

interface Command
{
	keyword: string;
	state: string;
	description: string;
	authRequired?: boolean;
	clientRequired?: boolean;
	options?: CommandOptions;
}

function setCaretPosition( el: HTMLInputElement, caretPos: number )
{
	// This is used to not only get "focus", but
	// to make sure we don't have it everything -selected-
	// (it causes an issue in chrome, and having it doesn't hurt any other browser)
	el.value = el.value;

	if ( el !== null ) {
		if ( el.createTextRange ) {
			var range = el.createTextRange();
			range.move( 'character', caretPos );
			range.select();
		}
		// (el.selectionStart === 0 added for Firefox bug)
		else if ( el.selectionStart || el.selectionStart === 0 ) {
			el.focus();
			el.setSelectionRange( caretPos, caretPos );
		}
	}
}

@Component({
	selector: 'gj-search-autocomplete',
	template,
})
export class AutocompleteComponent implements OnInit
{
	LocalDb_Game: any;

	mode: 'search' | 'command' = 'search';
	isVisible = false;
	commands: Command[];
	filteredCommands: Command[];

	selected = 0;
	games: any[] = [];
	users: any[] = [];
	libraryGames: any[] = [];
	items: any[] = [];

	@Input( '<?searchAutocompleteModes' ) modes: string[] = [ 'search', 'command' ];

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$injector' ) $injector: any,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'orderByFilter' ) private orderByFilter: ng.IFilterOrderBy,
		@Inject( 'hotkeys' ) private hotkeys: ng.hotkeys.HotkeysProvider,
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
		@Inject( 'Environment' ) private environment: any,
		@Inject( 'App' ) private app: App,
		@Inject( 'Analytics' ) private analytics: any,
		@Inject( 'Search' ) private Search: Search,
		@Inject( 'Search_History' ) private searchHistory: Search_History,
		@Inject( 'Fuzzysearch' ) private fuzzysearch: any,
		@Inject( 'Popover' ) private popover: any,
		@Inject( 'User' ) private user: any,
		@Inject( 'Game' ) private game: any,

		@Inject( SearchComponent ) @SkipSelf() private searchCtrl: SearchComponent
	)
	{
		this.LocalDb_Game = environment.isClient ? $injector.get( 'LocalDb_Game' ) : null;

		// this.modes = this.modes || ;

		this.commands = [
			{
				keyword: ':discover',
				state: 'discover.home',
				description: gettext( 'commands.discover_description' ),
			},
			{
				keyword: ':games',
				state: 'discover.games.list.section',
				options: { section: 'featured' },
				description: gettext( 'commands.games_description' ),
			},
			{
				keyword: ':news',
				state: 'discover.news.list',
				description: gettext( 'commands.news_description' ),
			},
			{
				keyword: ':dashboard',
				state: 'dashboard.main.overview',
				authRequired: true,
				description: gettext( 'commands.dashboard_description' ),
			},
			{
				keyword: ':library',
				state: 'library.overview',
				authRequired: true,
				description: gettext( 'commands.library_description' ),
			},
			{
				keyword: ':installed',
				state: 'library.installed',
				clientRequired: true,
				description: gettext( 'commands.installed_description' ),
			},
			{
				keyword: ':account',
				state: 'dashboard.account.edit',
				authRequired: true,
				description: gettext( 'commands.account_description' ),
			},
			{
				keyword: ':activity',
				state: 'dashboard.activity.list',
				authRequired: true,
				description: gettext( 'commands.activity_description' ),
			},
			{
				keyword: ':settings',
				state: 'settings',
				authRequired: true,
				description: gettext( 'commands.settings_description' ),
			},
		];

		this.commands = orderByFilter( this.commands, 'keyword' );
		this.filteredCommands = this.commands;

		// Generate the debounced method.
		this.sendSearch = _.debounce( () => this._sendSearch(), 200, { leading: false, maxWait: 750, trailing: true } );
	}

	ngOnInit()
	{
		this.searchCtrl.setKeydownSpy( event =>
		{
			let min = 0;
			let max = 0;

			if ( this.mode == 'search' ) {
				max = this.items.length;
			}
			else if ( this.mode == 'command' ) {
				max = this.filteredCommands.length - 1;
			}

			if ( event.keyCode == KEYCODE_DOWN ) {
				this.selected = Math.min( this.selected + 1, max );
			}
			else if ( event.keyCode == KEYCODE_UP ) {
				this.selected = Math.max( this.selected - 1, min );
			}
			else if ( event.keyCode == KEYCODE_ENTER ) {
				this.selectActive();
			}
			else if ( event.keyCode == KEYCODE_ESC ) {

				// If they had a command in there but escaped, then remove the whole command.
				if ( this.mode == 'command' ) {
					this.searchCtrl.query = '';
				}
			}
		} );

		this.$scope.$watchGroup( [
			'$ctrl.searchCtrl.isFocused',
			'$ctrl.searchCtrl.isEmpty()',
		],
		vals =>
		{
			const isFocused = vals[0];
			const isEmpty = vals[1];

			if ( isFocused && !isEmpty ) {
				this.showAutocomplete( this.searchCtrl.searchElem );
			}
			else {
				this.hideAutocomplete();
			}
		} );

		this.$scope.$watch( () => this.searchCtrl.query, () =>
		{
			this.onChange();
		} );

		// Fast command input.
		this.hotkeys.bindTo( this.$scope )
			.add( {
				combo: ':',
				description: 'Focus the search bar for command input.',
				callback: ( event: Event ) =>
				{
					// Get around stupid scope already in progress.
					this.$timeout( () =>
					{
						event.preventDefault();
						this.searchCtrl.query = ':';

						// We push their cursor after the ":".
						// This will also focus it.
						setCaretPosition( this.searchCtrl.inputElem[0], 1 );
					} );
				}
			} );
	}

	getPopover()
	{
		return this.popover.getPopover( 'search-autocomplete' );
	}

	showAutocomplete( element: ng.IAugmentedJQuery )
	{
		if ( !this.isVisible && !this.searchCtrl.isEmpty() && this.inAvailableMode() ) {
			this.isVisible = true;
			this.getPopover().show( element );
		}
	}

	hideAutocomplete()
	{
		if ( this.isVisible ) {
			this.isVisible = false;
			this.getPopover().hide();
		}
	}

	inAvailableMode()
	{
		return this.modes.indexOf( this.mode ) !== -1;
	}

	// This gets debounced.
	// We need to generate it debounced in the constructor.
	sendSearch: () => void;

	private _sendSearch()
	{
		if ( this.searchCtrl.isEmpty() || !this.inAvailableMode() ) {
			return;
		}

		// We store the query that we're waiting on.
		const thisQuery = this.searchCtrl.query;
		this.Search.search( thisQuery, { type: 'typeahead' } ).then( payload =>
		{
			// We only update the payload if the query is still the same as when we sent.
			// This makes sure we don't step on ourselves while typing fast.
			// Payloads may not come back sequentially.
			if ( this.searchCtrl.query === thisQuery ) {
				this.games = payload.games;
				this.users = payload.users;
				this.libraryGames = payload.libraryGames;

				// All items so we can calculate global selection indexes easily.
				// This needs to be in the order that they will show in the results list.
				this.items = []
					.concat( this.libraryGames )
					.concat( this.games )
					.concat( this.users )
					;
			}
		} );
	}

	selectActive()
	{
		if ( this.searchCtrl.isEmpty() ) {
			return;
		}

		if ( this.mode == 'search' ) {
			this.searchHistory.record( this.searchCtrl.query );

			// Selected the "show all results" option.
			if ( this.selected === 0 ) {
				this.viewAll();
			}
			else {
				const item = this.items[ (this.selected - 1) ];
				if ( item instanceof this.game ) {
					this.selectGame( item );
				}
				else if ( item instanceof this.user ) {
					this.selectUser( item );
				}
				else if ( this.environment.isClient && item instanceof this.LocalDb_Game ) {
					this.selectLibraryGame( item );
				}
			}
		}
		else if ( this.mode == 'command' ) {
			const command = this.filteredCommands[ this.selected ];
			this.selectCommand( command );
		}

		this.searchCtrl.blur();
	}

	viewAll()
	{
		this.$state.go( 'search.results', { q: this.searchCtrl.query } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-all' );
	}

	selectGame( game )
	{
		this.$state.go( 'discover.games.view.overview', { slug: game.slug, id: game.id } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-game' );
	}

	selectUser( user )
	{
		this.$state.go( 'profile.overview', { slug: user.slug, id: user.id } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-user' );
	}

	selectLibraryGame( localGame )
	{
		this.$state.go( 'discover.games.view.overview', { slug: localGame.slug, id: localGame.id } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-library-game' );
	}

	selectCommand( command: Command )
	{
		if ( command && command.state ) {
			this.searchCtrl.query = '';  // Set it as blank.
			this.$state.go( command.state, command.options || {} );
			this.analytics.trackEvent( 'search', 'autocomplete', 'go-command' );
		}
	}

	onChange()
	{
		// Reset the selected index.
		this.selected = 0;

		if ( this.searchCtrl.isEmpty() ) {
			return;
		}

		if ( this.searchCtrl.query[0] == ':' ) {
			this.mode = 'command';
			this.filteredCommands = [];

			for ( const command of this.commands ) {
				if ( !this.app.user && command.authRequired ) {
					continue;
				}

				if ( !this.environment.isClient && command.clientRequired ) {
					continue;
				}

				if ( this.searchCtrl.query.length === 1
					|| this.fuzzysearch( this.searchCtrl.query.toLowerCase(), command.keyword )
				) {
					this.filteredCommands.push( command );
				}
			}
		}
		else {
			this.mode = 'search';
			this.sendSearch();
		}
	}
}
