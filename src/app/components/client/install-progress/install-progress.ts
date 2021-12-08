import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatDuration } from '../../../../_common/filters/duration';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { LocalDbPackage, LocalDbPackagePatchState } from '../local-db/package/package.model';

@Options({
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
			return `~${formatDuration(this.packageProgress.timeLeft)}`;
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
