import type { Router } from 'vue-router';
import type { RouteLocationDefinition } from '../../../../../utils/router';
import { Client } from '../../../../../_common/client/client.service';
import { commonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { AppStore } from '../../../../store';
import { UserTokenModal } from '../../../user/token-modal/token-modal.service';

export function createClientTrayMenuBuilder(router: Router, appStore: AppStore) {
	function go(location: RouteLocationDefinition) {
		router.push(location);
		Client.show();
	}

	function logout() {
		return appStore.logout();
	}

	return function clientTrayMenuBuilder(this: undefined, menu: nw.Menu) {
		menu.append(
			new nw.MenuItem({
				label: $gettext(`Home`),
				click: () =>
					go({
						name: 'home',
					}),
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Discover`),
				click: () =>
					go({
						name: 'discover.home',
					}),
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Store`),
				click: () =>
					go({
						name: 'discover.games.list._fetch',
						params: { section: null as any },
					}),
			})
		);

		menu.append(new nw.MenuItem({ type: 'separator' }));

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Game Library`),
				click: () => go({ name: 'library.installed' }),
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Edit Account`),
				click: () => go({ name: 'dash.account.edit' }),
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Your Profile`),
				click: () =>
					go({
						name: 'profile.overview',
						params: { username: commonStore.user.value!.username },
					}),
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Your Game Token`),
				click: () => {
					UserTokenModal.show();
					Client.show();
				},
			})
		);

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Device Settings`),
				click: () => go({ name: 'dash.account.device-settings' }),
			})
		);

		menu.append(new nw.MenuItem({ type: 'separator' }));

		menu.append(
			new nw.MenuItem({
				label: $gettext(`Logout`),
				click: () => {
					logout();
					Client.show();
				},
			})
		);
	};
}
