import { parse } from 'qs';
import { computed, inject, InjectionKey, ref } from 'vue';
import { Api } from '../../_common/api/api.service';
import { Environment } from '../../_common/environment/environment.service';
import { GameBuildModel } from '../../_common/game/build/build.model';
import { GameModel } from '../../_common/game/game.model';
import { GamePackageModel } from '../../_common/game/package/package.model';
import { Meta } from '../../_common/meta/meta-service';

export const GameserverStoreKey: InjectionKey<GameserverStore> = Symbol('gameserver-store');

export type GameserverStore = ReturnType<typeof createGameserverStore>;

export function useGameserverStore() {
	return inject(GameserverStoreKey)!;
}

export function createGameserverStore() {
	const game = ref<GameModel>();
	const gamePackage = ref<GamePackageModel>();
	const build = ref<GameBuildModel>();
	const url = ref('');

	const javaArchive = ref('');
	const javaCodebase = ref('');

	const username = ref('');
	const token = ref('');

	const embedWidth = computed(() => {
		if (!build.value) {
			return undefined;
		}

		return build.value.embed_fit_to_screen ? '100%' : build.value.embed_width;
	});

	const embedHeight = computed(() => {
		if (!build.value) {
			return undefined;
		}

		return build.value.embed_fit_to_screen ? '100%' : build.value.embed_height;
	});

	// The "style" ones are for use in stylesheets (requires the 'px' unit).
	const embedWidthStyle = computed(() => {
		if (!build.value) {
			return undefined;
		}

		return build.value.embed_fit_to_screen ? '100%' : build.value.embed_width + 'px';
	});

	const embedHeightStyle = computed(() => {
		if (!build.value) {
			return undefined;
		}

		return build.value.embed_fit_to_screen ? '100%' : build.value.embed_height + 'px';
	});

	async function bootstrap() {
		Api.apiHost = Environment.gameserverApiHost;

		const query = parse(window.location.search.substring(1));
		if (!query['token']) {
			throw new Error('Invalid token.');
		}

		const tokenId = query['token'];
		let requestUrl = `/gameserver/${tokenId}`;

		if (!Environment.isSecure) {
			requestUrl += '?insecure';
		}

		const response = await Api.sendRequest(requestUrl);

		game.value = new GameModel(response.game);
		gamePackage.value = new GamePackageModel(response.package);
		build.value = new GameBuildModel(response.build);
		url.value = response.url;

		javaArchive.value = response.javaArchive;
		javaCodebase.value = response.javaCodebase;

		if (response.username && response.token) {
			username.value = response.username;
			token.value = response.token;
		}

		Meta.title = gamePackage.value.title || game.value.title;
	}

	return {
		game,
		gamePackage,
		build,
		url,
		javaArchive,
		javaCodebase,
		username,
		token,
		embedWidth,
		embedHeight,
		embedWidthStyle,
		embedHeightStyle,

		bootstrap,
	};
}
