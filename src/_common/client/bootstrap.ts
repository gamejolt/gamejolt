import { CommonStore } from '../store/common-store';
import { initClientApiInterceptors } from './api/api.service';
import { ClientUpdater } from './client-updater.service';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient({ commonStore }: { commonStore: CommonStore }) {
	initClientApiInterceptors();
	Client.init();
	ClientUser.init({ commonStore });
	ClientUpdater.init();
}
