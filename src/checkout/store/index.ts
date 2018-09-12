import { VuexStore, VuexModule } from '../../lib/gj-lib-client/utils/vuex';
import {
	AppStore,
	Mutations as AppMutations,
	Actions as AppActions,
	appStore,
} from '../../lib/gj-lib-client/vue/services/app/app-store';
import {
	ThemeActions,
	ThemeMutations,
	ThemeStore,
} from '../../lib/gj-lib-client/components/theme/theme.store';

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
