<script lang="ts">
import { Options, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../api/api.service';

/**
 * How long to wait after a request has started before showing the loading bar.
 */
const ShowDelay = 500;

/**
 * How long to wait before hiding the bar again after it has been visible. We
 * delay this so that it doesn't flash really fast.
 */
const HideDelay = 200;

@Options({})
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

	get apiRequestCount() {
		return Api.loadingBarRequests.value;
	}

	mounted() {
		// NOTICE: Router may not be available on all sections (like gameserver).

		// We hook into router so that we can show loading bar while the async
		// component chunks are being loaded by webpack.
		this.$router?.beforeEach((_to, _from, next) => {
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

		this.$router?.beforeResolve((_to, _from, next) => {
			this.routeChanging = false;
			this.addComplete();
			next();
		});
	}

	private addRequest() {
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

	private addComplete() {
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

	@Watch('apiRequestCount')
	onApiLoadCountChanged() {
		if (this.apiRequestCount > this.requestCount) {
			this.addRequest();
		} else if (this.apiRequestCount < this.requestCount) {
			this.addComplete();
		}
		this.requestCount = this.apiRequestCount;
	}
}
</script>

<template>
	<transition>
		<div v-if="width > 0 && shouldShow" class="loading-bar anim-fade-enter anim-fade-leave">
			<div class="loading-bar-bar" :style="{ width: width + '%' }" />
		</div>
	</transition>
</template>

<style lang="stylus" scoped>
.loading-bar
	position: fixed
	top: 0
	left: 0
	right: 0
	height: 3px
	pointer-events: none
	z-index: $zindex-loading-bar

	&-bar
		change-bg('highlight')
		height: 3px
		transition: width 300ms $strong-ease-out
		will-change: width
</style>
