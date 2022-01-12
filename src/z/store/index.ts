import { reactive } from 'vue';
import { buildUseStore, VuexModule, VuexStore } from '../../utils/vuex';

export type Actions = {};

export type Mutations = {};

@VuexModule({
	store: true,
	modules: {},
})
export class Store extends VuexStore<Store, Actions, Mutations> {}

export const store = reactive(new Store()) as Store;
export const useStore = buildUseStore<Store>();
