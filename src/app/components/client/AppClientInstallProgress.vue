<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatDuration } from '../../../_common/filters/duration';
import AppProgressBar from '../../../_common/progress/AppProgressBar.vue';
import { LocalDbPackage, LocalDbPackagePatchState } from './local-db/package/package.model';

const props = defineProps({
	localPackage: {
		type: Object as PropType<LocalDbPackage>,
		required: true,
	},
});

const { localPackage } = toRefs(props);

const patchState = computed(() => {
	if (!localPackage.value) {
		return null;
	}

	const state =
		localPackage.value.install_state !== null
			? localPackage.value.install_state
			: localPackage.value.update_state;
	if (state === null) {
		return null;
	}

	return state;
});

const packageProgress = computed(() => {
	const state = patchState.value;
	if (state === LocalDbPackagePatchState.DOWNLOADING) {
		return localPackage.value.download_progress;
	} else if (state === LocalDbPackagePatchState.UNPACKING) {
		return localPackage.value.unpack_progress;
	}
	return null;
});

const shouldShowSpeed = computed(() => patchState.value === LocalDbPackagePatchState.DOWNLOADING);

const timeLeft = computed(() => {
	if (!packageProgress.value?.timeLeft || packageProgress.value.timeLeft === Infinity) {
		return '--';
	}

	return `~${formatDuration(packageProgress.value.timeLeft)}`;
});

const speed = computed(() => {
	if (!packageProgress.value?.rate) {
		return '--';
	}
	return `${packageProgress.value.rate.toFixed(0)} KBps`;
});
</script>

<template>
	<div v-if="packageProgress" class="client-install-progress">
		<p
			class="client-install-progress-info client-install-progress-info-percent text-center small"
		>
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
			<span v-if="shouldShowSpeed" class="pull-left client-install-progress-info-speed">
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
