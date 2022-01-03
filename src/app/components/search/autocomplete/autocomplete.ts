import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { debounce } from '../../../../utils/utils';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { AppStore } from '../../../../_common/store/app-store';
import { EventTopic } from '../../../../_common/system/event/event-topic';
import { User } from '../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import * as _LocalDbGameMod from '../../client/local-db/game/game.model';
import AppGameCompatIcons from '../../game/compat-icons/compat-icons.vue';
import { sendSearch } from '../search-service';
import { SearchKeydownSpy, useSearchController } from '../search.vue';

let LocalDbGameMod: typeof _LocalDbGameMod | undefined;
if (GJ_IS_DESKTOP_APP) {
	LocalDbGameMod = require('../../client/local-db/game/game.model');
}

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;

@Options({
	components: {
		AppGameThumbnailImg,
		AppGameCompatIcons,
		AppUserVerifiedTick,
	},
})
export default class AppSearchAutocomplete extends Vue {
	@State app!: AppStore;

	selected = 0;
	games: Game[] = [];
	users: User[] = [];
	libraryGames: _LocalDbGameMod.LocalDbGame[] = [];
	items: any[] = [];

	search = setup(() => useSearchController()!);

	searchChanges = new EventTopic<string>();
	searched$ = this.searchChanges.subscribe(
		debounce((query: string) => this.sendSearch(query), 500)
	);

	_keydownSpy?: SearchKeydownSpy;

	get isHidden() {
		return this.search.isEmpty;
	}

	mounted() {
		this._keydownSpy = (event: KeyboardEvent) => {
			const min = 0;
			const max = this.items.length;

			if (event.keyCode === KEYCODE_DOWN) {
				this.selected = Math.min(this.selected + 1, max);
			} else if (event.keyCode === KEYCODE_UP) {
				this.selected = Math.max(this.selected - 1, min);
			} else if (event.keyCode === KEYCODE_ENTER) {
				this.selectActive();
			}
		};

		this.search.setKeydownSpy(this._keydownSpy);
	}

	unmounted() {
		this.searched$.close();

		if (this._keydownSpy) {
			this.search.removeKeydownSpy(this._keydownSpy);
			this._keydownSpy = undefined;
		}
	}

	private async sendSearch(query: string) {
		if (this.search.isEmpty) {
			return;
		}

		// We store the query that we're waiting on.
		const payload = await sendSearch(query, { type: 'typeahead' });

		// We only update the payload if the query is still the same as when we sent.
		// This makes sure we don't step on ourselves while typing fast.
		// Payloads may not come back sequentially.
		if (this.search.query === query) {
			this.games = payload.games;
			this.users = payload.users;
			this.libraryGames = payload.libraryGames;

			// All items so we can calculate global selection indexes easily.
			// This needs to be in the order that they will show in the results list.
			this.items = ([] as any[])
				.concat(this.libraryGames)
				.concat(this.games)
				.concat(this.users);
		}
	}

	selectActive() {
		if (this.search.isEmpty) {
			return;
		}

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

		this.search.blur();
	}

	viewAll() {
		this.$router.push({
			name: 'search.results',
			query: { q: this.search.query },
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

	@Watch('search.query')
	onChange(query: string) {
		// Reset the selected index.
		this.selected = 0;

		if (this.search.isEmpty || !this.app) {
			return;
		}

		this.searchChanges.next(query);
	}
}
