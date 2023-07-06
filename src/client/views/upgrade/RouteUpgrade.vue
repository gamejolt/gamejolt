<script lang="ts">
import { computed } from 'vue';
import { illMaintenance } from '../../../_common/illustration/illustrations';
import AppButton from '../../../_common/button/AppButton.vue';
import { ClientUpdater } from '../../../_common/client/client-updater.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppProgressBar from '../../../_common/progress/AppProgressBar.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const status = computed(() => ClientUpdater.clientUpdateStatus);

const progress = computed(() => {
	// Lets avoid having two progress bars by combining download + extract progress reports.
	// 80% download, 20% extract seems like a nice mix.

	const progress = ClientUpdater.clientUpdateProgress;
	if (!progress) {
		return 0;
	}

	if (progress.type === 'download') {
		return Math.round(progress.percent * 0.8);
	}
	return 80 + Math.round(progress.percent * 0.2);
});

createAppRoute({
	routeTitle: computed(() => `Updating Game Jolt...`),
	disableTitleSuffix: true,
	onInit() {
		ClientUpdater.checkForClientUpdates();
	},
});

function update() {
	ClientUpdater.updateClient();
}
</script>

<template>
	<div class="-wrapper">
		<div class="-content container">
			<AppIllustration class="-no-chat" :asset="illMaintenance" />

			<AppSpacer vertical :scale="4" />

			<template v-if="status === 'error'">
				<div class="alert alert-notice">
					<p>
						<strong>
							<AppTranslate> Oh no, the desktop app failed to update </AppTranslate>
						</strong>
					</p>
					<p>
						Try restarting it. If it still doesn't work,
						<a href="https://gamejolt.com/client">reinstall it from the website</a>.
					</p>
				</div>
			</template>

			<template v-else-if="status !== 'ready'">
				<p class="lead">
					<strong>
						<template v-if="status === 'fetching'">
							<AppTranslate>Downloading new version...</AppTranslate>
						</template>
						<template v-else>
							<AppTranslate>Checking for updates...</AppTranslate>
						</template>
					</strong>
				</p>

				<AppProgressBar active :percent="progress" />
			</template>

			<template v-else>
				<div class="text-center">
					<AppButton lg @click="update()">
						<AppTranslate>Apply update</AppTranslate>
					</AppButton>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 100px
	left: 0
	display: flex
	flex-direction: column
	justify-content: center
</style>
