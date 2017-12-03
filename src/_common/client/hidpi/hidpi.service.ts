import { Window } from 'nw.gui';

export function checkClientHiDpi() {
	if (window.devicePixelRatio > 1 || window.screen.width > 2600) {
		const win = Window.get();

		console.log('Detected HiDPI screen. Changing zoom level.');
		win.zoomLevel = 4;
	}
}
