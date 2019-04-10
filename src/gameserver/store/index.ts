import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	ThemeActions,
	ThemeMutations,
	ThemeStore,
} from 'game-jolt-frontend-lib/components/theme/theme.store';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { parse } from 'qs';

export type Actions = AppActions &
	ThemeActions & {
		bootstrap: undefined;
	};

export type Mutations = AppMutations &
	ThemeMutations & {
		_bootstrap: any;
	};

@VuexModule({
	store: true,
	modules: {
		app: appStore,
		theme: new ThemeStore(),
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;
	theme!: ThemeStore;

	game: Game | null = null;
	package: GamePackage | null = null;
	build: GameBuild | null = null;
	url = '';

	javaArchive = '';
	javaCodebase = '';

	username = '';
	token = '';

	get embedWidth() {
		if (!this.build) {
			return undefined;
		}

		return this.build.embed_fit_to_screen ? '100%' : this.build.embed_width;
	}

	get embedHeight() {
		if (!this.build) {
			return undefined;
		}

		return this.build.embed_fit_to_screen ? '100%' : this.build.embed_height;
	}

	// The "style" ones are for use in stylesheets (requires the 'px' unit).
	get embedWidthStyle() {
		if (!this.build) {
			return undefined;
		}

		return this.build.embed_fit_to_screen ? '100%' : this.build.embed_width + 'px';
	}

	get embedHeightStyle() {
		if (!this.build) {
			return undefined;
		}

		return this.build.embed_fit_to_screen ? '100%' : this.build.embed_height + 'px';
	}

	@VuexAction
	async bootstrap() {
		Api.apiHost = Environment.gameserverApiHost;

		const query = parse(window.location.search.substring(1));
		if (!query['token']) {
			throw new Error('Invalid token.');
		}

		const tokenId = query['token'];
		let url = `/gameserver/${tokenId}`;

		if (!Environment.isSecure) {
			url += '?insecure';
		}

		const response = await Api.sendRequest(url);
		this._bootstrap(response);
	}

	@VuexMutation
	private _bootstrap(response: any) {
		this.game = new Game(response.game);
		this.package = new GamePackage(response.package);
		this.build = new GameBuild(response.build);
		this.url = response.url;

		this.javaArchive = response.javaArchive;
		this.javaCodebase = response.javaCodebase;

		if (response.username && response.token) {
			this.username = response.username;
			this.token = response.token;
		}

		Meta.title = this.package.title || this.game.title;
	}
}

export const store = new Store();
