import View from '!view!./install-progress.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { duration } from '../../../../lib/gj-lib-client/vue/filters/duration';
import { LocalDbPackage, LocalDbPackagePatchState } from '../local-db/package/package.model';

@View
@Component({
	components: {
		AppProgressBar,
	},
})
export class AppClientInstallProgress extends Vue {
	@Prop(LocalDbPackage) localPackage: LocalDbPackage;

	get patchState() {
		if (!this.localPackage) {
			return null;
		}

		const state =
			this.localPackage.install_state !== null
				? this.localPackage.install_state
				: this.localPackage.update_state;
		if (state === null) {
			return null;
		}

		return state;
	}

	get packageProgress() {
		const state = this.patchState;
		if (state === LocalDbPackagePatchState.DOWNLOADING) {
			return this.localPackage.download_progress;
		} else if (state === LocalDbPackagePatchState.UNPACKING) {
			return this.localPackage.unpack_progress;
		}
		return null;
	}

	get shouldShowSpeed() {
		return this.patchState === LocalDbPackagePatchState.DOWNLOADING;
	}

	get timeLeft() {
		if (
			this.packageProgress &&
			this.packageProgress.timeLeft &&
			this.packageProgress.timeLeft !== Infinity
		) {
			return `~${duration(this.packageProgress.timeLeft)}`;
		}
		return '--';
	}

	get speed() {
		if (this.packageProgress && this.packageProgress.rate) {
			return `${this.packageProgress.rate.toFixed(0)} KBps`;
		}
		return '--';
	}
}
