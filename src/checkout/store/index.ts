import { buildUseStore, VuexModule, VuexStore } from '../../utils/vuex';
import {
	Actions as AppActions,
	AppStore,
	appStore,
	Mutations as AppMutations,
} from '../../_common/store/app-store';
import { ThemeActions, ThemeMutations, ThemeStore } from '../../_common/theme/theme.store';

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
export const useStore = buildUseStore<Store>();
