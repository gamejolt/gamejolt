import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Screen } from '../../../_common/screen/screen-service';

@Component({})
export default class AppFlashlight extends Vue {
	x = 0;
	y = 0;

	get visible() {
		return Screen.isPointerMouse;
	}

	$refs!: {
		light: HTMLImageElement;
	};

	mounted() {
		document.addEventListener('mousemove', this.reposition);
	}

	beforeDestroy() {
		document.removeEventListener('mousemove', this.reposition);
	}

	reposition(e: MouseEvent) {
		this.x = e.pageX - 200;
		this.y = e.pageY - 200;
	}
}
