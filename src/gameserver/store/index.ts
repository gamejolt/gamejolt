import { parse } from 'qs';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Api } from '../../_common/api/api.service';
import { Environment } from '../../_common/environment/environment.service';
import { GameBuild } from '../../_common/game/build/build.model';
import { Game } from '../../_common/game/game.model';
import { GamePackage } from '../../_common/game/package/package.model';
import { Meta } from '../../_common/meta/meta-service';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../_common/store/app-store';
import { ThemeActions, ThemeMutations, ThemeStore } from '../../_common/theme/theme.store';

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

		Meta.setTitle(this.package.title || this.game.title);
	}
}

export const store = new Store();
