import { VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import { initClientApiInterceptors } from './api/api.service';
import { ClientUpdater } from './client-updater.service';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient(sectionStore: VuexStore) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init(sectionStore);
	ClientUpdater.init();
}
