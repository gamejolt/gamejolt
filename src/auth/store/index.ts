import {
	VuexStore,
	VuexModule,
	VuexMutation,
	VuexAction,
} from '../../lib/gj-lib-client/utils/vuex';
import {
	AppStore,
	Mutations as AppMutations,
	Actions as AppActions,
	appStore,
} from '../../lib/gj-lib-client/vue/services/app/app-store';
import { MediaItem } from '../../lib/gj-lib-client/components/media-item/media-item-model';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';

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
