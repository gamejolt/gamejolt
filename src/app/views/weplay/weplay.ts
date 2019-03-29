import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

const LOCALSTORAGE_KEY = 'weplay-timeout';

@Component({
	name: 'RouteWeplay',
	components: {},
	directives: {
		AppTooltip,
	},
})
export default class RouteWeplay extends BaseRouteComponent {
	private timeoutFor = 0;
	private timer!: NodeJS.Timer;

	@State
	app!: AppStore;

	get routeTitle() {
		return 'WePlay';
	}

	get isDisabled() {
		return !this.app.user || this.timeoutFor > 0;
	}

	get timeoutFormatted() {
		return (this.timeoutFor / 1000).toFixed(2);
	}

	mounted() {
		this.checkTimeout = this.checkTimeout.bind(this);
		this.checkTimeout();
		this.timer = setInterval(this.checkTimeout, 100);
	}

	beforeDestroy() {
		clearInterval(this.timer);
	}

	private checkTimeout() {
		const value = localStorage.getItem(LOCALSTORAGE_KEY);
		if (value !== null) {
			const num = parseInt(value);
			if (num !== NaN) {
				const timeout = num - Date.now();
				this.timeoutFor = timeout;
				return;
			}
		}
		this.timeoutFor = 0;
	}

	public async onClickKey(key: string) {
		if (this.timeoutFor > 0) {
			return;
		}

		const $payload = await Api.sendRequest(
			'/web/weplay/process-input',
			{ key },
			{ detach: true }
		);
		if ($payload.success) {
			const timeoutValue = ($payload.wait * 1000 + Date.now()).toString();
			localStorage.setItem(LOCALSTORAGE_KEY, timeoutValue);
		}
	}
}
