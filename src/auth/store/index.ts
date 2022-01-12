import { reactive } from 'vue';
import { buildUseStore, VuexAction, VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Api } from '../../_common/api/api.service';
import { Game } from '../../_common/game/game.model';
import { MediaItem } from '../../_common/media-item/media-item-model';

export type Actions = {
	bootstrap: undefined;
};

export type Mutations = {
	showCoverImage: undefined;
	hideCoverImage: undefined;
	processPayload: any;
};

@VuexModule({
	store: true,
	modules: {},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	shouldShowCoverImage = true;
	coverMediaItem?: MediaItem = undefined;
	coverGame?: Game = undefined;

	@VuexAction
	async bootstrap() {
		const payload = await Api.sendRequest('/web/auth/get-customized-page');
		this.processPayload(payload);
	}

	@VuexMutation
	showCoverImage() {
		this.shouldShowCoverImage = true;
	}

	@VuexMutation
	hideCoverImage() {
		this.shouldShowCoverImage = false;
	}

	@VuexMutation
	processPayload(payload: Mutations['processPayload']) {
		this.coverMediaItem = payload.mediaItem && new MediaItem(payload.mediaItem);
		this.coverGame = payload.game && new Game(payload.game);
	}
}

export const store = reactive(new Store()) as Store;
export const useStore = buildUseStore<Store>();
