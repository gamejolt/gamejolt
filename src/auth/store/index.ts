import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { VuexAction, VuexModule, VuexMutation, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from 'game-jolt-frontend-lib/vue/services/app/app-store';

export type Actions = AppActions & {
	bootstrap: undefined;
};

export type Mutations = AppMutations & {
	showCoverImage: undefined;
	hideCoverImage: undefined;
	processPayload: any;
};

@VuexModule({
	store: true,
	modules: {
		app: appStore,
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;

	shouldShowCoverImage = true;
	coverMediaItem?: MediaItem = undefined;

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
		if (payload.mediaItem) {
			this.coverMediaItem = new MediaItem(payload.mediaItem);
		}
	}
}

export const store = new Store();
