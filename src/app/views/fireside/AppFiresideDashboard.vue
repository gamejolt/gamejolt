<script lang="ts" setup>
import { computed } from 'vue';
import AppButton from '../../../_common/button/AppButton.vue';
import { stopStreaming } from '../../../_common/fireside/rtc/producer';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../_common/modal/confirm/confirm-service';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import {
	FiresideSidebar,
	useFiresideController,
} from '../../components/fireside/controller/controller';
import AppFiresideStreamStats from '../../components/fireside/stream/stream-stats/AppFiresideStreamStats.vue';
import AppFiresideStream from './_stream/AppFiresideStream.vue';

const {
	rtc,
	stickerTargetController,
	collapseSidebar,
	background,
	isFullscreen,
	setSidebar,
	sidebarHome,
} = useFiresideController()!;

const overlayText = computed(() => !!background.value || isFullscreen.value);
const localUser = computed(() => rtc.value?.localUser);
const videoAspectRatio = computed(() => localUser.value?.videoAspectRatio || 0.5625);

function _setSidebar(option: FiresideSidebar, buttonLocation: string) {
	setSidebar(option, buttonLocation);
}

async function _stopStreaming(location: string) {
	const producer = rtc.value?.producer;
	if (!producer) {
		return;
	}

	const result = await ModalConfirm.show(`Are you sure you want to stop streaming?`);
	if (!result) {
		return;
	}

	try {
		await stopStreaming(producer, location);
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong when stopping your stream.`));
	}

	if (!producer.isStreaming.value) {
		setSidebar(sidebarHome, 'stopped-streaming-dashboard');
	}
}
</script>

<template>
	<div class="fireside-dashboard">
		<div
			v-if="localUser"
			class="-producer-dash"
			:class="{ '-single-col': !localUser.hasVideo }"
		>
			<div class="-producer-dash-left">
				<div style="width: 100%">
					<div class="-producer-video-header">
						<h4 class="sans-margin-top">
							{{ $gettext(`Outgoing video`) }}
						</h4>
					</div>

					<div
						class="-producer-video"
						:style="{
							paddingTop: 100 / videoAspectRatio + '%',
						}"
					>
						<template v-if="localUser">
							<AppStickerTarget
								:key="localUser.uid"
								class="-video-inner"
								:controller="stickerTargetController"
							>
								<AppFiresideStream
									:rtc-user="localUser"
									:has-header="isFullscreen"
									:has-hosts="isFullscreen"
									:sidebar-collapsed="collapseSidebar"
								/>
							</AppStickerTarget>
						</template>
					</div>
				</div>

				<div style="width: 100%">
					<AppButton
						block
						solid
						:overlay="overlayText"
						@click="_setSidebar('stream-settings', 'producer-dashboard')"
					>
						{{ $gettext(`Stream settings`) }}
					</AppButton>

					<AppButton
						block
						solid
						fill-color="overlay-notice"
						:overlay="overlayText"
						@click="_stopStreaming('producer-dashboard')"
					>
						{{ $gettext(`Stop streaming`) }}
					</AppButton>
				</div>
			</div>

			<div v-if="localUser.hasVideo">
				<h4 class="sans-margin-top">
					{{ $gettext(`Video stats`) }}
				</h4>
				<AppFiresideStreamStats class="-producer-dash-stats" no-abs />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-dashboard
	padding: 0 32px
	width: 100%
	height: 100%
	display: flex
	align-items: center
	justify-content: center

.-producer-dash
	--left-col: minmax(0, 450px)
	max-width: 1100px
	height: 100%
	display: grid
	grid-template-columns: var(--left-col) minmax(0, 250px)
	justify-content: center
	gap: $line-height-computed
	flex: 1

	&.-single-col
		grid-template-columns: var(--left-col)

.-producer-dash-left
	display: flex
	flex-direction: column
	flex-wrap: nowrap
	gap: 12px
	align-items: stretch

.-producer-video-header
	display: flex
	gap: 8px
	align-items: flex-start
	justify-content: space-between

.-producer-video
	position: relative
	width: 100%
	transition: width 200ms, height 200ms, padding-top 200ms, border-radius 1s

.-video-inner
	elevate-2()
	border-radius: var(--video-radius)
	overflow: hidden
	flex-direction: column
	background-color: var(--theme-bg-subtle)
	position: absolute !important
	left: 0
	top: 0
	right: 0
	bottom: 0

.-producer-dash-stats
	width: auto
</style>
