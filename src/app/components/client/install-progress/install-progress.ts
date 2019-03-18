import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { duration } from 'game-jolt-frontend-lib/vue/filters/duration';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { LocalDbPackage, LocalDbPackagePatchState } from '../local-db/package/package.model';

@Component({
	components: {
		AppProgressBar,
	},
})
export default class AppClientInstallProgress extends Vue {
	@Prop(LocalDbPackage) localPackage!: LocalDbPackage;

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
