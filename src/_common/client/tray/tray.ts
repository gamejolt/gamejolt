import Vue, { CreateElement } from 'vue';
import { State } from 'vuex-class';
import { Window, Tray, Menu, MenuItem } from 'nw.gui';
import { Component } from 'vue-property-decorator';

import { Client } from '../client.service';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';

declare var global: NodeJS.Global & {
	tray: Tray | undefined;
};

@Component({})
export class AppClientTray extends Vue {
	@State app: AppStore;

	isFocused = false;
	isMinimized = false;
	isClosed = false;

	static hook = {
		menuBuilder: undefined as ((menu: Menu) => void) | undefined,
	};

	/**
	 * Whether or not the app will actually quit when you tell it to or if it
	 * will do a soft quit.
	 */
	get isClientGreedy() {
		return this.app.clientSection === 'app';
	}

	mounted() {
		const win = Window.get();

		win.on('blur', () => (this.isFocused = false));
		win.on('focus', () => (this.isFocused = true));
		win.on('minimize', () => (this.isMinimized = true));
		win.on('restore', () => (this.isMinimized = false));

		win.on('close', () => {
			// If we should just minimize to tray instead of quitting.
			if (this.isClientGreedy) {
				this.isClosed = true;
				this.isMinimized = false;
				win.hide();
			} else {
				// Otherwise actually quit.
				Client.quit();
			}
		});
	}

	private toggleVisibility() {
		const win = Window.get();

		if (this.isClosed || this.isMinimized || !this.isFocused) {
			Client.show();
			this.isClosed = false;
		} else {
			// If the window is being shown and is focused, let's minimize it.
			win.minimize();
		}
	}

	render(h: CreateElement) {
		// Changes to these will refresh the render function.
		if (global.tray) {
			global.tray.remove();
			global.tray = undefined;
		}

		const tray = new Tray({
			title: 'Game Jolt Client',
			// This has to be a relative path, hence the removal of the first /.
			icon: require(`./icon${Screen.isHiDpi ? '-2x' : ''}-2x.png`).substr(1),
			click: () => this.toggleVisibility(),
		} as any);

		const menu = new Menu();

		if (AppClientTray.hook.menuBuilder) {
			AppClientTray.hook.menuBuilder(menu);
		}

		menu.append(
			new MenuItem({
				label: this.$gettext('Quit'),
				click: () => Client.quit(),
			})
		);

		tray.menu = menu;
		global.tray = tray;

		return h('div');
	}
}
