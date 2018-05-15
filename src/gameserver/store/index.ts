import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../lib/gj-lib-client/vue/services/app/app-store';
import {
	ThemeActions,
	ThemeMutations,
	ThemeStore,
} from '../../lib/gj-lib-client/components/theme/theme.store';
import {
	VuexModule,
	VuexStore,
	VuexAction,
	VuexMutation,
} from '../../lib/gj-lib-client/utils/vuex';
import { Game } from '../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../../lib/gj-lib-client/components/game/build/build.model';
import { Environment } from '../../lib/gj-lib-client/components/environment/environment.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../lib/gj-lib-client/components/meta/meta-service';
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
	app: AppStore;
	theme: ThemeStore;

	game: Game | null = null;
	package: GamePackage | null = null;
	build: GameBuild | null = null;
	url = '';

	javaArchive = '';
	javaCodebase = '';

	username = '';
	token = '';

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
