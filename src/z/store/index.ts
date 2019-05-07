import { VuexModule, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { ThemeStore } from '../../lib/gj-lib-client/components/theme/theme.store';

export type Actions = AppActions & {};

export type Mutations = AppMutations & {};

@VuexModule({
	store: true,
	modules: {
		app: appStore,
		theme: new ThemeStore(),
	},
})
export class Store extends VuexStore<Store, Actions, Mutations> {
	app!: AppStore;
}

export const store = new Store();
