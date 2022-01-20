import { RouteLocationRaw } from 'vue-router';
import { Client } from '../../../../../_common/client/client.service';
import { commonStore } from '../../../../../_common/store/common-store';
import { Translate } from '../../../../../_common/translate/translate.service';
import { router } from '../../../../views/index';
import { UserTokenModal } from '../../../user/token-modal/token-modal.service';

function go(location: RouteLocationRaw) {
	router.push(location);
	Client.show();
}

export function clientTrayMenuBuilder(this: undefined, menu: nw.Menu) {
	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Home'),
			click: () =>
				go({
					name: 'home',
				}),
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Explore'),
			click: () =>
				go({
					name: 'discover.home',
				}),
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Store'),
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
			label: Translate.$gettext('Game Library'),
			click: () => go({ name: 'library.installed' }),
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Edit Account'),
			click: () => go({ name: 'dash.account.edit' }),
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Your Profile'),
			click: () =>
				go({
					name: 'profile.overview',
					params: { username: commonStore.user.value!.username },
				}),
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Your Game Token'),
			click: () => {
				UserTokenModal.show();
				Client.show();
			},
		})
	);

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Settings'),
			click: () => go({ name: 'settings' }),
		})
	);

	menu.append(new nw.MenuItem({ type: 'separator' }));

	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Logout'),
			click: () => {
				// TODO(vue3): Yariv, make the client tray builder take an
				// optional app store when we're in the app section so we can
				// properly do this without raw

				// import appStore.logout();
				Client.show();
			},
		})
	);
}
