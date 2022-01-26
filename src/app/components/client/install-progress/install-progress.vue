<script lang="ts">
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
	@Prop(Object) localPackage!: LocalDbPackage;

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
</script>

<template>
	<div class="client-install-progress" v-if="packageProgress">
		<p class="client-install-progress-info client-install-progress-info-percent text-center small">
			<strong>{{ ((packageProgress.progress || 0) * 100.0).toFixed(0) }}%</strong>
		</p>

		<AppProgressBar
			thin
			:percent="(packageProgress.progress || 0) * 100.0"
			:indeterminate="localPackage.isUnpacking"
			:active="localPackage.isUnpacking"
			role="progressbar"
			:aria-valuenow="((packageProgress.progress || 0) * 100.0).toFixed(0)"
			aria-valuemin="0"
			aria-valuemax="100"
		/>

		<p class="client-install-progress-info small clearfix">
			<span class="pull-left client-install-progress-info-speed" v-if="shouldShowSpeed">
				<span v-translate="{ speed }">
					Speed:
					<strong>%{ speed }</strong>
				</span>
			</span>
			<span class="pull-right client-install-progress-info-time">
				<span v-translate="{ timeLeft }">
					Remaining:
					<strong>%{ timeLeft }</strong>
				</span>
			</span>
		</p>
	</div>
</template>
