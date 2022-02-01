import { CommonStore } from '../store/common-store';
import { ClientUpdater } from './client-updater.service';
import { Client } from './client.service';
import { ClientUser } from './user/user.service';

export function bootstrapCommonClient({ commonStore }: { commonStore: CommonStore }) {
	console.log('Bootstrapping common client');
	Client.init();
	ClientUser.init({ commonStore });
	ClientUpdater.init();
}
