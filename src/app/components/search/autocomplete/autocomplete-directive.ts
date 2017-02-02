import { Component, Inject, SkipSelf, OnInit } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./autocomplete.html';

import { App } from '../../../app-service';
import { Search } from '../search-service';
import { SearchComponent } from '../search-directive';
import { SearchHistory } from '../history/history-service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

interface Command
{
	keyword: string;
	state: string;
	description: string;
	authRequired?: boolean;
	clientRequired?: boolean;
	options?: Object;
}

function setCaretPosition( el: any, caretPos: number )
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
	commands: Command[];
	filteredCommands: Command[];

	selected = 0;
	games: any[] = [];
	devlogs: any[] = [];
	users: User[] = [];
	libraryGames: any[] = [];
	items: any[] = [];

	modes = [ 'search', 'command' ];

	get isHidden()
	{
		return this.searchCtrl.isEmpty();
	}

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$state' ) private $state: StateService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'orderByFilter' ) orderByFilter: ng.IFilterOrderBy,
		@Inject( 'hotkeys' ) private hotkeys: ng.hotkeys.HotkeysProvider,
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
		@Inject( 'App' ) private app: App,
		@Inject( 'Analytics' ) private analytics: any,
		@Inject( 'Search' ) private Search: Search,
		@Inject( 'SearchHistory' ) private searchHistory: SearchHistory,
		@Inject( 'Fuzzysearch' ) private fuzzysearch: any,
		@Inject( 'Popover' ) private popover: Popover,
		@Inject( SearchComponent ) @SkipSelf() private searchCtrl: SearchComponent
	)
	{
		this.LocalDb_Game = GJ_IS_CLIENT ? getProvider<any>( 'LocalDb_Game' ) : null;

		this.commands = [
			{
				keyword: ':discover',
				state: 'discover.home',
				description: gettext( 'commands.discover_description' ),
			},
			{
				keyword: ':games',
				state: 'discover.games.list._fetch',
				options: { section: 'featured' },
				description: gettext( 'commands.games_description' ),
			},
			{
				keyword: ':devlogs',
				state: 'discover.devlogs.overview',
				description: gettext( 'Browse devlogs.' ),
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
				state: 'dashboard.activity.feed',
				options: { tab: 'activity' },
				authRequired: true,
				description: gettext( 'commands.activity_description' ),
			},
			{
				keyword: ':notifications',
				state: 'dashboard.activity.feed',
				options: { tab: 'notifications' },
				authRequired: true,
				description: gettext( 'View your notifications.' ),
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
		this.searchCtrl.setKeydownSpy( ( event: KeyboardEvent ) =>
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
						if ( this.searchCtrl.inputElem ) {
							setCaretPosition( this.searchCtrl.inputElem[0], 1 );
						}
					} );
				}
			} );
	}

	getPopover()
	{
		return this.popover.getPopover( 'search-autocomplete' );
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
				this.devlogs = payload.devlogs;
				this.users = payload.users;
				this.libraryGames = payload.libraryGames;

				// All items so we can calculate global selection indexes easily.
				// This needs to be in the order that they will show in the results list.
				this.items = ([] as any[])
					.concat( this.libraryGames )
					.concat( this.games )
					.concat( this.devlogs )
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
				if ( item instanceof Game ) {
					this.selectGame( item );
				}
				else if ( item instanceof User ) {
					this.selectUser( item );
				}
				else if ( GJ_IS_CLIENT && item instanceof this.LocalDb_Game ) {
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

	selectGame( game: any )
	{
		this.$state.go( 'discover.games.view.overview', { slug: game.slug, id: game.id } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-game' );
	}

	selectUser( user: any )
	{
		this.$state.go( 'profile.overview', { username: user.username } );
		this.analytics.trackEvent( 'search', 'autocomplete', 'go-user' );
	}

	selectLibraryGame( localGame: any )
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

				if ( !GJ_IS_CLIENT && command.clientRequired ) {
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
