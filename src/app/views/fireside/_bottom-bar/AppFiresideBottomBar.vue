<script lang="ts">
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
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	FiresideSidebar,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import { FiresideHostsModal } from '../../../components/forms/fireside/hosts/modal/modal.service';
import AppFiresideBottomBarButton from './AppFiresideBottomBarButton.vue';
import AppFiresideBottomBarHosts from './AppFiresideBottomBarHosts.vue';

export type BottomBarControl = 'settings' | 'setup';
</script>

<script lang="ts" setup>
defineProps({
	overlay: {
		type: Boolean,
	},
});

const stickerLayer = useStickerLayer();
const c = useFiresideController()!;
const {
	user,
	stickerCount,
	canStream,
	canManageCohosts,
	hasStreams,
	isPersonallyStreaming,
	producer,
	sidebar,
	setSidebar,
	activeBottomBarControl,
} = c;

const stickerStore = useStickerStore();
const { canChargeSticker } = stickerStore;

const layer = useStickerLayer();
const { isAllCreator } = layer || {};

const canPlaceStickers = computed(() => !!user.value && !Screen.isMobile && hasStreams.value);

// TODO(oven): we might need to check the streaming devices instead of their selected ones here.
// I think we want to know if they're currently streaming using one of these devices so they can toggle on/off and stuff.
const hasMicDevice = computed(() => producer.value?.hasMicDevice.value === true);
const hasWebcamDevice = computed(() => producer.value?.hasWebcamDevice.value === true);
const micMuted = computed(() => producer.value?.micMuted.value === true);
const videoMuted = computed(() => producer.value?.videoMuted.value === true);

const micTooltip = computed(() => {
	if (!producer.value) {
		return undefined;
	}

	if (!hasMicDevice.value) {
		return $gettext(`No microphone selected`);
	}

	if (micMuted.value) {
		return $gettext(`Unmute microphone`);
	}

	return $gettext(`Mute microphone`);
});

const videoTooltip = computed(() => {
	if (!producer.value) {
		return undefined;
	}

	if (!hasWebcamDevice.value) {
		return $gettext(`No video selected`);
	}

	if (videoMuted.value) {
		return $gettext(`Show video`);
	}

	return $gettext(`Hide video`);
});

const micIcon = computed<Jolticon>(() => {
	const disabled = 'microphone-off';
	const enabled = 'microphone';

	if (!producer.value || !hasMicDevice.value || micMuted.value) {
		return disabled;
	}

	return enabled;
});

const videoIcon = computed<Jolticon>(() => {
	const disabled = 'video-camera-off';
	const enabled = 'video-camera';

	if (!producer.value || !hasWebcamDevice.value || videoMuted.value) {
		return disabled;
	}

	return enabled;
});

async function onClickMic() {
	const _producer = producer.value;
	if (!_producer) {
		return;
	}

	if (!_producer.isStreaming) {
		toggleStreamSettings();
		return;
	}

	if (!hasWebcamDevice.value || videoMuted.value) {
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

	if (hasMicDevice.value) {
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

	if (!hasMicDevice.value || micMuted.value) {
		const shouldStopStreaming = await _confirmStopStreaming(true);
		if (shouldStopStreaming) {
			stopStreaming(_producer, 'last-input-video');
		}
		return;
	}

	if (hasWebcamDevice.value) {
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

function showHostsModal() {
	FiresideHostsModal.show({ controller: c });
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
					v-app-tooltip="
						isPersonallyStreaming
							? $gettext(`Stream settings`)
							: $gettext(`Set up your stream`)
					"
					:active="sidebar === 'stream-settings'"
					:icon="isPersonallyStreaming ? 'dashboard' : 'broadcast'"
					@click="toggleStreamSettings"
				/>

				<template v-if="isPersonallyStreaming && producer">
					<AppFiresideBottomBarButton
						v-app-tooltip="micTooltip"
						:active="producer.hasMicDevice.value && !micMuted"
						:icon="micIcon"
						:disabled="!producer.hasMicDevice.value"
						@click="onClickMic"
					/>

					<AppFiresideBottomBarButton
						v-app-tooltip="videoTooltip"
						:active="producer.hasWebcamDevice.value && !videoMuted"
						:icon="videoIcon"
						:disabled="!producer.hasWebcamDevice.value"
						@click="onClickVideo"
					/>

					<AppFiresideBottomBarButton
						v-app-tooltip="$gettext(`Stop streaming`)"
						icon="hang-up"
						:disabled="producer.isBusy.value"
						active-color="overlay-notice"
						active
						@click="onClickStopStreaming"
					/>
				</template>
			</div>

			<div class="-hosts">
				<AppScrollScroller horizontal>
					<div class="-group">
						<AppFiresideBottomBarHosts @stream-settings="toggleStreamSettings()" />
					</div>
				</AppScrollScroller>
			</div>

			<div class="-group -right" :class="{ '-shrink': !canStream }">
				<AppFiresideBottomBarButton
					v-if="canManageCohosts"
					v-app-tooltip="$gettext(`Manage hosts`)"
					icon="friend-add-2"
					@click="showHostsModal"
				/>

				<AppAnimElectricity
					shock-anim="square"
					ignore-asset-padding
					:disabled="!canChargeSticker || !isAllCreator"
				>
					<AppFiresideBottomBarButton
						v-app-tooltip="$gettext(`Place stickers`)"
						icon="sticker-filled"
						:badge="stickerCount"
						:disabled="!canPlaceStickers"
						@click="onClickStickerButton"
					/>
				</AppAnimElectricity>

				<AppFiresideBottomBarButton
					v-app-tooltip="$gettext(`Fireside settings`)"
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
