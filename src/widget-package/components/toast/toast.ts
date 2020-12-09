import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppToast extends Vue {
	@Prop(String) type!: string;

	timeout?: number;

	mounted() {
		if (!this.type) {
			this.type = 'info';
		}
		this.setTimer();
	}

	focus() {
		this.clear();
	}

	blur() {
		this.setTimer();
	}

	dismiss() {
		this.$emit('dismiss');
		this.clear();
	}

	private setTimer() {
		this.timeout = window.setTimeout(() => this.dismiss(), 3000);
	}

	private clear() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}
}
