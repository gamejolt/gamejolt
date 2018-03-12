import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./dark-mode.html?style=./dark-mode.styl';

@View
@Component({})
export class AppShellDarkMode extends Vue {
	@Prop(Boolean) visible: boolean;

	cb: typeof AppShellDarkMode.prototype.reposition | null = null;
	x = 0;
	y = 0;

	$refs: {
		light: HTMLImageElement;
	};

	mounted() {
		this.cb = (e: MouseEvent) => this.reposition(e);
		document.addEventListener('mousemove', this.cb);
	}

	destroyed() {
		if (!this.cb) {
			return;
		}

		document.removeEventListener('mousemove', this.cb);
	}

	reposition(e: MouseEvent) {
		this.x = e.pageX - 200;
		this.y = e.pageY - 200;
	}
}
