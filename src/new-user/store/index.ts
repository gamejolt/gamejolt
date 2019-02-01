import { VuexModule, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../lib/gj-lib-client/vue/services/app/app-store';

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
}

export const store = new Store();
