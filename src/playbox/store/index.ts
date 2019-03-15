import { VuexModule, VuexStore } from 'game-jolt-frontend-lib/utils/vuex';

export type Actions = {};

export type Mutations = {};

@VuexModule({
	store: true,
})
export class Store extends VuexStore<Store, Actions, Mutations> {}

export const store = new Store();
