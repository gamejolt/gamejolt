<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { debounce } from '../../../utils/utils';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../_common/popper/popper.service';
import { Ruler } from '../../../_common/ruler/ruler-service';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import AppTheme from '../../../_common/theme/AppTheme.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import {
	toggleStreamVideoStats,
	useFiresideController,
} from '../../components/fireside/controller/controller';
import AppFiresideStreamStats from '../../components/fireside/stream/stream-stats/AppFiresideStreamStats.vue';
import AppFiresideStream from './_stream/AppFiresideStream.vue';

const c = useFiresideController()!;
const {
	rtc,
	stickerTargetController,
	collapseSidebar,
	background,
	isFullscreen,
	popperTeleportId,
} = c;

const videoContainer = ref<HTMLDivElement>();

const videoWidth = ref(0);
const videoHeight = ref(0);

const overlayText = computed(() => !!background.value || isFullscreen.value);
const localUser = computed(() => rtc.value?.localUser);
const producer = computed(() => rtc.value?.producer);
const videoAspectRatio = computed(() => localUser.value?.videoAspectRatio || 0.5625);
const shouldShowVideoStats = computed(() => rtc.value?.shouldShowVideoStats === true);

const singleCol = computed(() => !localUser.value?.hasVideo || producer.value?.videoMuted.value);

onMounted(() => {
	onDimensionsChange();
});

function onDimensionsChange() {
	if (!videoContainer.value) {
		return;
	}

	const { width, height } = Ruler.offset(videoContainer.value);
	const containerRatio = width / height;

	let receiveRatio = videoAspectRatio.value;

	const minRatio = 0.5;
	const maxRatio = 2;
	receiveRatio = Math.max(minRatio, Math.min(maxRatio, receiveRatio));

	// If the video is wider than the containing element...
	if (receiveRatio > containerRatio) {
		videoWidth.value = width;
		videoHeight.value = width / receiveRatio;
	} else if (receiveRatio < containerRatio) {
		videoHeight.value = height;
		videoWidth.value = height * receiveRatio;
	} else {
		videoWidth.value = width;
		videoHeight.value = height;
	}
}

const debounceDimensionsChange = debounce(onDimensionsChange, 500);

watch(videoAspectRatio, onDimensionsChange);

function toggleVideoStats() {
	Popper.hideAll();
	toggleStreamVideoStats(c);
}
</script>

<template>
	<div class="fireside-dashboard">
		<AppTheme
			v-if="localUser"
			class="-producer-dash"
			:class="{ '-single-col': singleCol, '-overlay-text': overlayText }"
			:force-dark="overlayText"
		>
			<div v-if="!singleCol">
				<h4 class="sans-margin-top">
					{{ $gettext(`Stream stats`) }}
				</h4>
				<AppFiresideStreamStats class="-producer-dash-stats" no-abs />
			</div>

			<div class="-producer-dash-video">
				<div class="-producer-video-header">
					<h4 class="sans-margin-top">
						{{ $gettext(`Stream preview`) }}
					</h4>
				</div>

				<div
					ref="videoContainer"
					v-app-observe-dimensions="debounceDimensionsChange"
					class="-producer-video-container"
				>
					<div
						class="-producer-video"
						:style="{
							width: videoWidth + 'px',
							height: videoHeight + 'px',
						}"
					>
						<template v-if="localUser">
							<AppStickerTarget
								:key="localUser.userId"
								class="-video-inner"
								:controller="stickerTargetController"
							>
								<AppPopper
									class="-popper-wrapper"
									trigger="right-click"
									:to="`#${popperTeleportId}`"
								>
									<AppFiresideStream
										:rtc-user="localUser"
										:has-header="isFullscreen"
										:has-hosts="isFullscreen"
										:sidebar-collapsed="collapseSidebar"
										:no-stats="!isFullscreen"
									/>

									<template #popover>
										<div class="list-group">
											<a class="list-group-item" @click="toggleVideoStats()">
												{{
													shouldShowVideoStats
														? $gettext(`Hide Fullscreen Video Stats`)
														: $gettext(`Show Fullscreen Video Stats`)
												}}
											</a>
										</div>
									</template>
								</AppPopper>
							</AppStickerTarget>
						</template>
					</div>
				</div>
			</div>
		</AppTheme>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-dashboard
	padding: 0 8px
	width: 100%
	height: 100%
	display: flex
	align-items: center
	justify-content: center

.-overlay-text
	fireside-overlay-text-shadow()
	color: white

.-producer-dash
	--stream-col: minmax(0, 1fr)
	height: 100%
	width: 100%
	display: grid
	grid-template-columns: minmax(0, 250px) var(--stream-col)
	grid-template-rows: minmax(0, 1fr)
	justify-content: center
	gap: $line-height-computed
	flex: 1

	&.-single-col
		grid-template-columns: var(--stream-col)

.-producer-dash-video
	display: flex
	flex-direction: column
	flex-wrap: nowrap
	align-items: stretch

.-producer-video-container
	flex: 1
	min-width: 0
	min-height: 0

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
	display: flex
	justify-content: center
	align-items: center
	position: absolute !important
	left: 0
	top: 0
	right: 0
	bottom: 0

.-producer-dash-stats
	width: auto
</style>
