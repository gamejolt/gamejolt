import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';
// import { Navigate } from '../../navigate/navigate.service';
// import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
// import { Client } from '../client.service';

// const trayIcons = import.meta.globEager('./icon*.png');

@Options({})
export class AppClientTray extends Vue {
	commonStore = setup(() => useCommonStore());

	// get app() {
	// 	return this.commonStore;
	// }

	// isFocused = false;
	// isMinimized = false;
	// isClosed = false;

	// tray: nw.Tray | null = null;

	// static hook = {
	// 	menuBuilder: undefined as ((menu: nw.Menu) => void) | undefined,
	// };

	// /**
	//  * Whether or not the app will actually quit when you tell it to or if it
	//  * will do a soft quit.
	//  */
	// get isClientGreedy() {
	// 	return Navigate.currentClientSection === 'app';
	// }

	// mounted() {
	// 	this.registerWindowEvents();
	// 	this.createTray();
	// }

	// unmounted() {
	// 	this.removeTray();
	// }

	// registerWindowEvents() {
	// 	const win = nw.Window.get();

	// 	win.on('blur', () => (this.isFocused = false));
	// 	win.on('focus', () => (this.isFocused = true));
	// 	win.on('minimize', () => {
	// 		this.isMinimized = true;
	// 	});
	// 	win.on('restore', () => {
	// 		this.isMinimized = false;
	// 	});

	// 	win.on('close', () => {
	// 		// If we should just minimize to tray instead of quitting.
	// 		if (this.isClientGreedy) {
	// 			this.isClosed = true;
	// 			this.isMinimized = false;
	// 			Client.hide();
	// 		} else {
	// 			// Otherwise actually quit.
	// 			Client.quit();
	// 		}
	// 	});
	// }

	// createTray() {
	// 	if (this.tray || Navigate.isRedirecting) {
	// 		return;
	// 	}

	// 	this.tray = new nw.Tray({
	// 		title: 'Game Jolt Client',
	// 		// This has to be a relative path, hence the removal of the first /.
	// 		// TODO(vue3): check to make sure this still works
	// 		icon: trayIcons[`./icon${Screen.isHiDpi ? '-2x' : ''}.png`].default.substr(1),
	// 	});

	// 	Navigate.registerDestructor(() => {
	// 		this.removeTray();
	// 	});

	// 	this.tray.on('click', () => this.toggleVisibility());

	// 	const menu = new nw.Menu();

	// 	if (AppClientTray.hook.menuBuilder) {
	// 		AppClientTray.hook.menuBuilder(menu);
	// 	}

	// 	const quitItem = new nw.MenuItem({
	// 		label: this.$gettext('Quit'),
	// 	});

	// 	quitItem.on('click', () => Client.quit());

	// 	menu.append(quitItem);

	// 	this.tray.menu = menu;
	// }

	// removeTray() {
	// 	if (!this.tray) {
	// 		return;
	// 	}

	// 	this.tray.remove();
	// 	this.tray = null;
	// }

	// private toggleVisibility() {
	// 	const win = nw.Window.get();

	// 	if (this.isClosed || this.isMinimized || !this.isFocused) {
	// 		console.log('toggleVisibility');
	// 		Client.show();
	// 		this.isClosed = false;
	// 	} else {
	// 		// If the window is being shown and is focused, let's minimize it.
	// 		win.minimize();
	// 	}
	// }

	render() {
		return h('div');
	}
}
