import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Window } from 'nw.gui';

@Component({})
export class AppClientHidpi extends Vue {
	created() {
		if (window.devicePixelRatio > 1 || window.screen.width > 2600) {
			const win = Window.get();

			console.log('Detected HiDPI screen. Changing zoom level.');
			win.zoomLevel = 2;
		}
	}

	render(h: Vue.CreateElement) {
		return h('div');
	}
}
