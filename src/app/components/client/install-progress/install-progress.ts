import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./install-progress.html';
import { LocalDbPackage, PatchState } from '../local-db/package/package.model';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { duration } from '../../../../lib/gj-lib-client/vue/filters/duration';

@View
@Component({
	components: {
		AppProgressBar,
	},
})
export class AppClientInstallProgress extends Vue {
	@Prop(LocalDbPackage) localPackage: LocalDbPackage;

	duration = duration;

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
		if (state === PatchState.DOWNLOADING) {
			return this.localPackage.download_progress;
		} else if (state === PatchState.UNPACKING) {
			return this.localPackage.unpack_progress;
		}
		return null;
	}

	get shouldShowSpeed() {
		return this.patchState === PatchState.DOWNLOADING;
	}
}
