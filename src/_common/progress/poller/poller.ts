import Vue, { CreateElement } from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';

const PollInterval = 5000;

@Component({})
export class AppProgressPoller extends Vue {
	@Prop(String)
	url!: string;

	@Prop(Number)
	interval?: number;

	intervalHandle?: NodeJS.Timer;

	@Emit('progress')
	emitProgress(_response: unknown, _progress: number, _indeterminate: boolean) {}

	@Emit('complete')
	emitComplete(_response: unknown) {}

	@Emit('error')
	emitError(_response: unknown) {}

	mounted() {
		this.check();
		this.intervalHandle = setInterval(() => this.check(), this.interval || PollInterval);
	}

	async check() {
		if (!this.url) {
			return;
		}

		try {
			const response = await Api.sendRequest(this.url, undefined, {
				detach: true,
			});

			if (response.status === 'progress') {
				const indeterminate = typeof response.progress !== 'number';
				const progress = indeterminate ? 100 : response.progress;
				this.emitProgress(response, progress, indeterminate);
				return;
			}

			if (response.status === 'complete' || response.status === 'error') {
				if (response.status === 'complete') {
					this.emitComplete(response);
				} else if (response.status === 'error') {
					this.emitError(response);
				}

				this.clearInterval();
			}
		} catch (e) {
			this.$emit('error', e);
		}
	}

	destroyed() {
		this.clearInterval();
	}

	render(h: CreateElement) {
		return h('span');
	}

	private clearInterval() {
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = undefined;
		}
	}
}
