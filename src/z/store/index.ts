import { reactive } from 'vue';
import { buildUseStore, VuexModule, VuexStore } from '../../utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../_common/store/app-store';

export type Actions = AppActions & {};

export type Mutations = AppMutations & {};

@VuexModule({
	store: true,
	modules: {
		app: appStore,
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;
}

export const store = reactive(new Store()) as Store;
export const useStore = buildUseStore<Store>();
