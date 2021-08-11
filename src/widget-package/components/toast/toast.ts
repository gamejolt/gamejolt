import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppToast extends Vue {
	@Prop(String) type!: string;

	timeout?: number;

	@Emit('dismiss')
	emitDismiss() {}

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
		this.emitDismiss();
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
