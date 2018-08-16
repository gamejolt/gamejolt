import { VuexModule, VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../lib/gj-lib-client/vue/services/app/app-store';

export type Actions = AppActions;

export type Mutations = AppMutations;

@VuexModule({
	store: true,
	modules: {
		app: appStore,
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app: AppStore;
}

export const store = new Store();
