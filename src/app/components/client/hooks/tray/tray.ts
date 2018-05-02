import { Location } from 'vue-router';
import { Client } from '../../../../../_common/client/client.service';
import { UserTokenModal } from '../../../user/token-modal/token-modal.service';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { store } from '../../../../store/index';
import { router } from '../../../../views/index';

function go(location: Location) {
	router.push(location);
	Client.show();
}

export function clientTrayMenuBuilder(this: undefined, menu: nw.Menu) {
	menu.append(
		new nw.MenuItem({
			label: Translate.$gettext('Browse Games'),
			click: () =>
				go({
					name: 'discover.games.list._fetch',
					params: { section: 'featured' },
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
			label: Translate.$gettext('Dashboard'),
			click: () => go({ name: 'dash.main.overview' }),
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
					params: { username: store.state.app.user!.username },
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
				store.dispatch('logout');
				Client.show();
			},
		})
	);
}
