<script lang="ts" setup>
import { computed } from 'vue';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import AppTheme from '../../../_common/theme/AppTheme.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useFiresideController } from '../../components/fireside/controller/controller';
import AppFiresideStreamStats from '../../components/fireside/stream/stream-stats/AppFiresideStreamStats.vue';
import AppFiresideStream from './_stream/AppFiresideStream.vue';

const { rtc, stickerTargetController, collapseSidebar, background, isFullscreen } =
	useFiresideController()!;

const overlayText = computed(() => !!background.value || isFullscreen.value);
const localUser = computed(() => rtc.value?.localUser);
const producer = computed(() => rtc.value?.producer);
const videoAspectRatio = computed(() => localUser.value?.videoAspectRatio || 0.5625);

const singleCol = computed(() => !localUser.value?.hasVideo || producer.value?.videoMuted.value);
</script>

<template>
	<div class="fireside-dashboard">
		<AppTheme
			v-if="localUser"
			class="-producer-dash"
			:class="{ '-single-col': singleCol, '-overlay-text': overlayText }"
			:force-dark="overlayText"
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
									no-stats
								/>
							</AppStickerTarget>
						</template>
					</div>
				</div>
			</div>

			<div v-if="!singleCol">
				<h4 class="sans-margin-top">
					{{ $gettext(`Video stats`) }}
				</h4>
				<AppFiresideStreamStats class="-producer-dash-stats" no-abs />
			</div>
		</AppTheme>
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

.-overlay-text
	fireside-overlay-text-shadow()
	color: white

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
