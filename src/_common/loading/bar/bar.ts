import Axios from 'axios';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

/**
 * How long to wait after a request has started before showing the loading bar.
 */
const ShowDelay = 500;

/**
 * How long to wait before hiding the bar again after it has been visible. We
 * delay this so that it doesn't flash really fast.
 */
const HideDelay = 200;

@Component({})
export default class AppLoadingBar extends Vue {
	routeChanging = false;
	requestCount = 0;
	completedCount = 0;
	shouldShow = false;

	private showTimeout?: NodeJS.Timer;
	private clearTimeout?: NodeJS.Timer;

	get width() {
		if (!this.requestCount) {
			return 0;
		}

		return (this.completedCount / this.requestCount) * 100;
	}

	mounted() {
		// We hook into router so that we can show loading bar while the async
		// component chunks are being loaded by webpack.
		this.$router.beforeEach((_to, _from, next) => {
			// If we hit before each while in the middle of a route change, it
			// means that the previous one never resolved, so we should mark a
			// request as having been completed first.
			if (this.routeChanging) {
				this.addComplete();
			}

			this.routeChanging = true;
			this.addRequest();
			next();
		});

		this.$router.beforeResolve((_to, _from, next) => {
			this.routeChanging = false;
			this.addComplete();
			next();
		});

		Axios.interceptors.request.use(
			config => {
				this.addRequest(config);
				return config;
			},
			error => {
				this.addComplete(error.config);
				return Promise.reject(error);
			}
		);

		Axios.interceptors.response.use(
			response => {
				this.addComplete(response.config);
				return response;
			},
			error => {
				this.addComplete(error.config);
				return Promise.reject(error);
			}
		);
	}

	private addRequest(config?: any) {
		if (config && config.ignoreLoadingBar) {
			return;
		}

		// If we had a clear set, then let's cancel that out.
		if (this.clearTimeout) {
			clearTimeout(this.clearTimeout);
			this.clearTimeout = undefined;
		}

		if (!this.showTimeout) {
			this.show();
		}

		++this.requestCount;
	}

	private addComplete(config?: any) {
		if (config && config.ignoreLoadingBar) {
			return;
		}

		++this.completedCount;
		if (this.completedCount >= this.requestCount) {
			this.clear();
		}
	}

	private show() {
		this.showTimeout = setTimeout(() => {
			this.shouldShow = true;
		}, ShowDelay);
	}

	private clear() {
		if (this.showTimeout) {
			clearTimeout(this.showTimeout);
			this.showTimeout = undefined;
		}

		// Wait for the 100% width to show first.
		this.clearTimeout = setTimeout(() => {
			this.requestCount = 0;
			this.completedCount = 0;
			this.shouldShow = false;
		}, HideDelay);
	}
}
