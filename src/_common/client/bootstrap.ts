import Vue from 'vue';
import { initClientApiInterceptors } from './api/api.service';
import { VuexStore } from '../../lib/gj-lib-client/utils/vuex';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient(store: VuexStore) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init(store);

	Vue.use(vue => {
		(vue.prototype as any).GJ_IS_CLIENT = GJ_IS_CLIENT;
	});
}
