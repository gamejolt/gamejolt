import { initClientApiInterceptors } from './api/api.service';
import { VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient(store: VuexStore) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init(store);
}
