import { VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { initClientApiInterceptors } from './api/api.service';
import { Client } from './client.service';
import { store } from './store/index';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient(sectionStore: VuexStore) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init(sectionStore);
	store.dispatch('bootstrap');
}
