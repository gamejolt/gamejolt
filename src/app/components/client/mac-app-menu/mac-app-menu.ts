import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { ClientControl } from '../control/client.service';
import { Window, Menu, App } from 'nw.gui';

@Component({})
export class AppClientMacAppMenu extends Vue {
	mounted() {
		const win = Window.get();
		const menu = new Menu({ type: 'menubar' });

		menu.createMacBuiltin('Game Jolt Client');

		win.menu = menu;

		win.on('close', (intent: string) => {
			// If we should just minimize instead of quitting.
			// Many applications on mac just minimize instead of actually close.
			if (intent !== 'quit') {
				ClientControl.close();
			} else {
				ClientControl.quit();
			}
		});

		// reopen is Mac specific
		// When they click the dock, we need to show it in case they hid it with the close.
		App.on('reopen', () => ClientControl.show());
	}

	render(h: Vue.CreateElement) {
		h('div');
	}
}
