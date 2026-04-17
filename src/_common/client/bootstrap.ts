import { Client } from '~common/client/client.service';
import { ClientUpdater } from '~common/client/client-updater.service';
import { ClientUser } from '~common/client/user/user.service';
import { CommonStore } from '~common/store/common-store';

export function bootstrapCommonClient({ commonStore }: { commonStore: CommonStore }) {
	console.log('Bootstrapping common client');
	Client.init();
	ClientUser.init({ commonStore });
	ClientUpdater.init();
}
