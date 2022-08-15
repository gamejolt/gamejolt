import { h } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../api/api.service';

const PollInterval = 5000;

@Options({})
export class AppProgressPoller extends Vue {
	@Prop(String)
	url!: string;

	@Prop(Number)
	interval?: number;

	timeoutHandle?: NodeJS.Timer;

	@Emit('progress')
	emitProgress(_response: unknown, _progress: number, _indeterminate: boolean) {}

	@Emit('complete')
	emitComplete(_response: unknown) {}

	@Emit('error')
	emitError(_response: unknown) {}

	mounted() {
		this.check();
		this.setTimeout();
	}

	async check() {
		if (!this.url) {
			return;
		}

		let response;
		let hasError = false;
		try {
			response = await Api.sendRequest(this.url, undefined, {
				detach: true,
			});
		} catch (e) {
			this.emitError(e);
			hasError = true;
		}

		if (!hasError) {
			if (response.status === 'complete' || response.status === 'error') {
				if (response.status === 'complete') {
					this.emitComplete(response);
				} else if (response.status === 'error') {
					this.emitError(response);
				}
				return;
			}

			if (response.status === 'progress') {
				const indeterminate = typeof response.progress !== 'number';
				const progress = indeterminate ? 100 : response.progress;
				this.emitProgress(response, progress, indeterminate);
			}
		}

		this.setTimeout();
	}

	unmounted() {
		this.clearTimeout();
	}

	render() {
		return h('span');
	}

	private setTimeout() {
		this.clearTimeout();
		this.timeoutHandle = setTimeout(() => this.check(), this.interval || PollInterval);
	}

	private clearTimeout() {
		if (this.timeoutHandle) {
			clearTimeout(this.timeoutHandle);
			this.timeoutHandle = undefined;
		}
	}
}
