import { initClientApiInterceptors } from './api/api.service';
import { VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';
import { store } from './store/index';

export function bootstrapCommonClient(sectionStore: VuexStore) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init(sectionStore);
	console.log(store);
	store.dispatch('bootstrap');
}
