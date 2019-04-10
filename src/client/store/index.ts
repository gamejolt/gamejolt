import {
	ThemeActions,
	ThemeMutations,
	ThemeStore,
} from 'game-jolt-frontend-lib/components/theme/theme.store';
import { VuexModule, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from 'game-jolt-frontend-lib/vue/services/app/app-store';

export type Actions = AppActions & ThemeActions & {};

export type Mutations = AppMutations & ThemeMutations & {};

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
}

export const store = new Store();
