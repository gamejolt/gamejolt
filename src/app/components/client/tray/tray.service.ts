import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import * as gui from 'nw.gui';
import { ClientControl } from '../control/client.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';

export class ClientTray {
	private static clientTray: gui.Tray | null = null;

	static init() {
		let section = 'main';
		if (/^\/auth\.html/.test(window.location.pathname)) {
			section = 'auth';
		}

		// TRAY IS WINDOWS ONLY AT THIS TIME
		// We should turn this on for Linux when this bug is fixed:
		// https://github.com/nwjs/nw.js/issues/2771
		if (Device.os() !== 'windows') {
			return;
		}

		// This will happen if switching between sections.
		// Gotta destroy and recreate tray with new settings.
		if (this.clientTray) {
			this.clientTray.remove();
			this.clientTray = null;
		}

		// Whether or not the app will actually quit when you tell it to or if it will do a soft quit.
		const isClientGreedy = section !== 'auth';

		const win = gui.Window.get();
		let isMinimized = false;
		let isClosed = false;
		let isFocused = false;

		win.on('blur', () => (isFocused = false));
		win.on('focus', () => (isFocused = true));
		win.on('minimize', () => (isMinimized = true));
		win.on('restore', () => (isMinimized = false));

		win.on('close', () => {
			// If we should just minimize to tray instead of quitting.
			if (isClientGreedy) {
				isClosed = true;
				isMinimized = false;
				win.hide();
			} else {
				// Otherwise actually quit.
				ClientControl.quit();
			}
		});

		function toggleVisibility() {
			if (isClosed || isMinimized || !isFocused) {
				ClientControl.show();
				isClosed = false;
			} else {
				// If the window is being shown and is focused, let's minimize it.
				win.minimize();
			}
		}

		const packagePrefix = GJ_BUILD_TYPE === 'production' ? '/package' : '';
		const tray = new gui.Tray(
			{
				title: 'Game Jolt Client',

				// We split this up so that it doesn't get injected.
				// It needs to stay as a relative file path or it will break.
				icon:
					packagePrefix +
					'/app/components/client/tray/' +
					(Screen.isHiDpi ? 'icon-2x.png' : 'icon.png'),
				click: toggleVisibility,
			} as any /* use as any because typings for nw.gui are wrong at this time */
		);

		tray.tooltip = 'Game Jolt Client';

		const menu = new gui.Menu();

		if (section !== 'auth') {
			menu.append(
				new gui.MenuItem({
					label: 'Browse Games',
					click: function() {
						$state.go('discover.games.list._fetch', { section: 'featured' }, { inherit: false });
						ClientControl.show();
					},
				})
			);

			menu.append(new gui.MenuItem({ type: 'separator' }));

			menu.append(
				new gui.MenuItem({
					label: 'Game Library',
					click: function() {
						$state.go('library.installed');
						ClientControl.show();
					},
				})
			);

			menu.append(
				new gui.MenuItem({
					label: 'Dashboard',
					click: function() {
						$state.go('dash.main.overview');
						ClientControl.show();
					},
				})
			);

			menu.append(
				new gui.MenuItem({
					label: 'Edit Account',
					click: function() {
						$state.go('dash.account.edit');
						ClientControl.show();
					},
				})
			);

			menu.append(
				new gui.MenuItem({
					label: 'Your Profile',
					click: function() {
						$state.go('profile.overview', { username: App.user.username });
						ClientControl.show();
					},
				})
			);

			menu.append(
				new gui.MenuItem({
					label: 'Your Game Token',
					click: function() {
						UserTokenModal.show();
						ClientControl.show();
					},
				})
			);

			menu.append(
				new gui.MenuItem({
					label: 'Settings',
					click: function() {
						$state.go('settings');
						ClientControl.show();
					},
				})
			);

			menu.append(new gui.MenuItem({ type: 'separator' }));

			menu.append(
				new gui.MenuItem({
					label: 'Logout',
					click: function() {
						App.logout();
						ClientControl.show();
					},
				})
			);
		}

		menu.append(
			new gui.MenuItem({
				label: 'Quit',
				click: function() {
					ClientControl.quit();
				},
			})
		);

		tray.menu = menu;

		// Save a global reference to this tray so it doesn't get GCed.
		// TODO(rewrite): do we still need global?
		this.clientTray = tray;
	}
}
