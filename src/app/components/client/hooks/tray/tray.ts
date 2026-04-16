import type { Router } from 'vue-router';

import { showUserTokenModal } from '~app/components/user/token-modal/token-modal.service';
import { AppStore } from '~app/store';
import { Client } from '~common/client/client.service';
import { commonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import type { RouteLocationDefinition } from '~utils/router';

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
					showUserTokenModal();
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
