import 'rxjs/add/operator/debounceTime';

import View from '!view!./autocomplete.html?style=./autocomplete.styl';
import { Subject } from 'rxjs/Subject';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { fuzzysearch } from '../../../../lib/gj-lib-client/utils/string';
import { findRequiredVueParent } from '../../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import * as _LocalDbGameMod from '../../client/local-db/game/game.model';
import { AppGameCompatIcons } from '../../game/compat-icons/compat-icons';
import { SearchHistory } from '../history/history-service';
import { AppSearch } from '../search';
import { Search } from '../search-service';

let LocalDbGameMod: typeof _LocalDbGameMod | undefined;
if (GJ_IS_CLIENT) {
	LocalDbGameMod = require('../../client/local-db/game/game.model');
}

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

interface Command {
	keyword: string;
	routeName: string;
	description: string;
	authRequired?: boolean;
	clientRequired?: boolean;
	params?: any;
}

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
		AppGameThumbnailImg,
		AppGameCompatIcons,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppSearchAutocomplete extends Vue {
	@State app!: AppStore;
	mode: 'search' | 'command' = 'search';

	selected = 0;
	games: Game[] = [];
	devlogs: Game[] = [];
	users: User[] = [];
	libraryGames: _LocalDbGameMod.LocalDbGame[] = [];
	items: any[] = [];

	modes = ['search', 'command'];

	search: AppSearch | null = null;

	searchChanges = new Subject<string>();
	searched$ = this.searchChanges.debounceTime(500).subscribe(query => {
		this.sendSearch(query);
	});

	get isHidden() {
		return this.search!.isEmpty();
	}

	created() {
		this.search = findRequiredVueParent(this, AppSearch);
	}

	mounted() {
		this.search!.setKeydownSpy((event: KeyboardEvent) => {
			let min = 0;
			let max = 0;

			if (this.mode === 'search') {
				max = this.items.length;
			} else if (this.mode === 'command') {
				max = this.filteredCommands.length - 1;
			}

			if (event.keyCode === KEYCODE_DOWN) {
				this.selected = Math.min(this.selected + 1, max);
			} else if (event.keyCode === KEYCODE_UP) {
				this.selected = Math.max(this.selected - 1, min);
			} else if (event.keyCode === KEYCODE_ENTER) {
				this.selectActive();
			} else if (event.keyCode === KEYCODE_ESC) {
				// If they had a command in there but escaped, then remove the whole command.
				if (this.mode === 'command') {
					this.search!.query = '';
				}
			}
		});
	}

	get commands() {
		const commands: Command[] = [
			{
				keyword: ':discover',
				routeName: 'discover.home',
				description: this.$gettext('commands.discover_description'),
			},
			{
				keyword: ':games',
				routeName: 'discover.games.list._fetch',
				params: { section: 'featured' },
				description: this.$gettext('commands.games_description'),
			},
			{
				keyword: ':devlogs',
				routeName: 'discover.devlogs.overview',
				description: this.$gettext('Browse devlogs.'),
			},
			{
				keyword: ':dashboard',
				routeName: 'dash.main.overview',
				authRequired: true,
				description: this.$gettext('commands.dashboard_description'),
			},
			{
				keyword: ':library',
				routeName: 'library.overview',
				authRequired: true,
				description: this.$gettext('commands.library_description'),
			},
			{
				keyword: ':installed',
				routeName: 'library.installed',
				clientRequired: true,
				description: this.$gettext('commands.installed_description'),
			},
			{
				keyword: ':account',
				routeName: 'dash.account.edit',
				authRequired: true,
				description: this.$gettext('commands.account_description'),
			},
			{
				keyword: ':activity',
				routeName: 'activity',
				params: { tab: 'activity' },
				authRequired: true,
				description: this.$gettext('commands.activity_description'),
			},
			{
				keyword: ':notifications',
				routeName: 'activity',
				params: { tab: 'notifications' },
				authRequired: true,
				description: this.$gettext('View your notifications.'),
			},
			{
				keyword: ':settings',
				routeName: 'settings',
				authRequired: true,
				description: this.$gettext('commands.settings_description'),
			},
		];

		return commands.sort((a, b) => stringSort(a.keyword, b.keyword));
	}

	get filteredCommands() {
		const commands = this.commands;
		const isLoggedIn = this.app && this.app.user;
		const search = this.search!;

		if (this.mode !== 'command') {
			return commands;
		}

		const filteredCommands = [];
		for (const command of commands) {
			if (!isLoggedIn && command.authRequired) {
				continue;
			}

			if (!GJ_IS_CLIENT && command.clientRequired) {
				continue;
			}

			if (
				search.query.length === 1 ||
				fuzzysearch(search.query.toLowerCase(), command.keyword)
			) {
				filteredCommands.push(command);
			}
		}

		return filteredCommands;
	}

	getPopover() {
		return Popover.getPopover('search-autocomplete');
	}

	inAvailableMode() {
		return this.modes.indexOf(this.mode) !== -1;
	}

	private async sendSearch(query: string) {
		if (this.search!.isEmpty() || !this.inAvailableMode()) {
			return;
		}

		// We store the query that we're waiting on.
		const payload = await Search.search(query, { type: 'typeahead' });

		// We only update the payload if the query is still the same as when we sent.
		// This makes sure we don't step on ourselves while typing fast.
		// Payloads may not come back sequentially.
		if (this.search!.query === query) {
			this.games = payload.games;
			this.devlogs = payload.devlogs;
			this.users = payload.users;
			this.libraryGames = payload.libraryGames;

			// All items so we can calculate global selection indexes easily.
			// This needs to be in the order that they will show in the results list.
			this.items = ([] as any[])
				.concat(this.libraryGames)
				.concat(this.games)
				.concat(this.devlogs)
				.concat(this.users);
		}
	}

	selectActive() {
		if (this.search!.isEmpty()) {
			return;
		}

		if (this.mode === 'search') {
			SearchHistory.record(this.search!.query);

			// Selected the "show all results" option.
			if (this.selected === 0) {
				this.viewAll();
			} else {
				const item = this.items[this.selected - 1];
				if (item instanceof Game) {
					this.selectGame(item);
				} else if (item instanceof User) {
					this.selectUser(item);
				} else if (LocalDbGameMod) {
					if (item instanceof LocalDbGameMod.LocalDbGame) {
						this.selectLibraryGame(item);
					}
				}
			}
		} else if (this.mode === 'command') {
			const command = this.filteredCommands[this.selected];
			this.selectCommand(command);
		}

		this.search!.blur();
	}

	viewAll() {
		this.$router.push({
			name: 'search.results',
			query: { q: this.search!.query },
		});

		Analytics.trackEvent('search', 'autocomplete', 'go-all');
	}

	selectGame(game: Game) {
		this.$router.push({
			name: 'discover.games.view.overview',
			params: { slug: game.slug, id: game.id + '' },
		});

		Analytics.trackEvent('search', 'autocomplete', 'go-game');
	}

	selectUser(user: User) {
		this.$router.push({
			name: 'profile.overview',
			params: { username: user.username },
		});

		Analytics.trackEvent('search', 'autocomplete', 'go-user');
	}

	selectLibraryGame(localGame: _LocalDbGameMod.LocalDbGame) {
		this.$router.push({
			name: 'discover.games.view.overview',
			params: { slug: localGame.slug, id: localGame.id + '' },
		});
		Analytics.trackEvent('search', 'autocomplete', 'go-library-game');
	}

	selectCommand(command: Command) {
		if (command && command.routeName) {
			this.search!.query = ''; // Set it as blank.

			this.$router.push({
				name: command.routeName,
				params: command.params || undefined,
			});

			Analytics.trackEvent('search', 'autocomplete', 'go-command');
		}
	}

	@Watch('search.query')
	onChange(query: string) {
		// Reset the selected index.
		this.selected = 0;

		if (this.search!.isEmpty() || !this.app) {
			return;
		}

		if (this.search!.query[0] === ':') {
			this.mode = 'command';
		} else {
			this.mode = 'search';
			this.searchChanges.next(query);
		}
	}
}
