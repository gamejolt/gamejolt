<script lang="ts">
export type BottomBarControl = 'manage-cohosts' | 'settings' | 'setup';
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import AppAnimElectricity from '../../../../_common/animation/AppAnimElectricity.vue';
import { setProducerDeviceMuted, stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useStickerLayer } from '../../../../_common/sticker/layer/layer-controller';
import { setStickerDrawerOpen, useStickerStore } from '../../../../_common/sticker/sticker-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	FiresideSidebar,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarButton from './AppFiresideBottomBarButton.vue';
import AppFiresideBottomBarHosts from './AppFiresideBottomBarHosts.vue';

defineProps({
	overlay: {
		type: Boolean,
	},
});

const stickerLayer = useStickerLayer();
const c = useFiresideController()!;
const {
	rtc,
	user,
	stickerCount,
	canStream,
	canManageCohosts,
	isStreaming,
	isPersonallyStreaming,
	sidebar,
	setSidebar,
	activeBottomBarControl,
} = c;

const stickerStore = useStickerStore();
const { canChargeSticker } = stickerStore;

const layer = useStickerLayer();
const { isAllCreator } = layer || {};

const canPlaceStickers = computed(() => !!user.value && !Screen.isMobile && isStreaming.value);

const producer = computed(() => rtc.value?.producer);
const localUser = computed(() => rtc.value?.localUser);

const producerMicMuted = computed(() => producer.value?.micMuted.value === true);
const producerVideoMuted = computed(() => producer.value?.videoMuted.value === true);

const micIcon = computed<Jolticon>(() => {
	const disabled = 'microphone-off';
	const enabled = 'microphone';

	if (!isPersonallyStreaming.value) {
		return disabled;
	}

	const _user = localUser.value;
	if (!_user || !_user._micAudioTrack || producer.value?.micMuted.value) {
		return disabled;
	}
	return enabled;
});

const videoIcon = computed<Jolticon>(() => {
	const disabled = 'video-camera-off';
	const enabled = 'video-camera';

	if (!isPersonallyStreaming.value) {
		return disabled;
	}

	const _user = localUser.value;
	if (!_user || !_user._videoTrack || producer.value?.videoMuted.value) {
		return disabled;
	}
	return enabled;
});

async function onClickMic() {
	const _producer = producer.value;
	if (!_producer) {
		return;
	}

	if (!isPersonallyStreaming.value) {
		toggleStreamSettings();
		return;
	}

	const _user = localUser.value;
	if (!_user) {
		return;
	}

	if (!_user.hasVideo || producerVideoMuted.value) {
		const shouldStopStreaming = await ModalConfirm.show(
			$gettext(
				`Disabling this will stop your current stream. Are you sure you want to stop streaming?`
			),
			$gettext(`Stop streaming?`),
			'yes'
		);
		if (shouldStopStreaming) {
			stopStreaming(_producer, 'last-input-mic');
		}
		return;
	}

	if (_user.hasMicAudio) {
		setProducerDeviceMuted(_producer, 'mic');
	} else {
		toggleStreamSettings();
	}
}

async function onClickVideo() {
	const _producer = producer.value;

	if (!_producer) {
		return;
	}

	if (!isPersonallyStreaming.value) {
		toggleStreamSettings();
		return;
	}

	const _user = localUser.value;
	if (!_user) {
		return;
	}

	if (!_user.hasMicAudio || producerMicMuted.value) {
		const shouldStopStreaming = await _confirmStopStreaming(true);
		if (shouldStopStreaming) {
			stopStreaming(_producer, 'last-input-video');
		}
		return;
	}

	if (_user.hasVideo) {
		setProducerDeviceMuted(_producer, 'video');
	} else {
		toggleStreamSettings();
	}
}

async function _confirmStopStreaming(throughInput: boolean) {
	let message = `Are you sure you want to stop streaming?`;
	let title: string | undefined = undefined;
	// Add some extra messaging if we're warning them through an attempted input disable.
	if (throughInput) {
		message = `Disabling this will stop your current stream. ${message}`;
		title = $gettext(`Stop streaming?`);
	}

	return ModalConfirm.show($gettext(message), title, 'yes');
}

function onClickStickerButton() {
	setStickerDrawerOpen(stickerStore, true, stickerLayer);
}

function toggleStreamSettings() {
	_toggleSidebar('stream-settings');
}

function toggleHosts() {
	_toggleSidebar('hosts');
}

function toggleFiresideSettings() {
	_toggleSidebar('fireside-settings');
}

function _toggleSidebar(value: FiresideSidebar) {
	const result = sidebar.value === value ? 'chat' : value;
	setSidebar(result, 'bottom-bar');
}

async function onClickStopStreaming() {
	if (!producer.value) {
		return;
	}

	const result = await _confirmStopStreaming(false);
	if (result) {
		stopStreaming(producer.value, 'bottom-bar');
	}
}
</script>

<template>
	<AppTheme class="-bottom-bar" :force-dark="overlay">
		<div class="-bottom-bar-inner">
			<div v-if="canStream" class="-group -left">
				<AppFiresideBottomBarButton
					:active="sidebar === 'stream-settings'"
					:icon="isPersonallyStreaming ? 'dashboard' : 'broadcast'"
					@click="toggleStreamSettings"
				/>

				<template v-if="isStreaming">
					<AppFiresideBottomBarButton
						:active="localUser?.hasMicAudio && !producerMicMuted"
						:icon="micIcon"
						:disabled="!localUser?._micAudioTrack"
						@click="onClickMic"
					/>

					<AppFiresideBottomBarButton
						:active="localUser?.hasVideo && !producerVideoMuted"
						:icon="videoIcon"
						:disabled="!localUser?._videoTrack"
						@click="onClickVideo"
					/>

					<AppFiresideBottomBarButton
						:active="localUser?.hasVideo && !producerVideoMuted"
						icon="hang-up"
						active-color="overlay-notice"
						:disabled="producer?.isBusy.value"
						@click="onClickStopStreaming"
					/>
				</template>
			</div>

			<div v-if="rtc" class="-hosts">
				<AppScrollScroller horizontal>
					<div class="-group">
						<AppFiresideBottomBarHosts @stream-settings="toggleStreamSettings()" />
					</div>
				</AppScrollScroller>
			</div>

			<div class="-group -right" :class="{ '-shrink': !canStream }">
				<AppFiresideBottomBarButton
					v-if="canManageCohosts"
					icon="friend-add-2"
					:active="activeBottomBarControl === 'manage-cohosts'"
					@click="toggleHosts"
				/>

				<AppAnimElectricity
					shock-anim="square"
					ignore-asset-padding
					:disabled="!canChargeSticker || !isAllCreator"
				>
					<AppFiresideBottomBarButton
						icon="sticker-filled"
						:badge="stickerCount"
						:disabled="!canPlaceStickers"
						@click="onClickStickerButton"
					/>
				</AppAnimElectricity>

				<AppFiresideBottomBarButton
					icon="ellipsis-h"
					:active="activeBottomBarControl === 'settings'"
					@click="toggleFiresideSettings"
				/>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-bottom-bar-inner
.-group
	display: flex
	align-items: center
	justify-content: center

.-bottom-bar
	width: 100%
	padding: 0 16px

.-hosts
	margin: 0 20px
	min-width: 0

.-group
	gap: 8px
	padding-bottom: 8px

.-left
.-right
	flex: 1 0

.-left
	justify-content: end

.-right
	justify-content: start

.-shrink
	flex: 0 1
</style>
