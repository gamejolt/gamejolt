<script lang="ts">
export type BottomBarControl = 'members' | 'settings' | 'setup';
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { setDrawerOpen, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { setProducerDeviceMuted, stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
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

const c = useFiresideController()!;
const {
	rtc,
	user,
	stickerCount,
	canStream,
	isStreaming,
	isPersonallyStreaming,
	sidebar,
	activeBottomBarControl,
} = c;

const drawerStore = useDrawerStore();

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
			stopStreaming(_producer);
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
		const shouldStopStreaming = await ModalConfirm.show(
			$gettext(
				`Disabling this will stop your current stream. Are you sure you want to stop streaming?`
			),
			$gettext(`Stop streaming?`),
			'yes'
		);
		if (shouldStopStreaming) {
			stopStreaming(_producer);
		}
		return;
	}

	if (_user.hasVideo) {
		setProducerDeviceMuted(_producer, 'video');
	} else {
		toggleStreamSettings();
	}
}

function onClickStickerButton() {
	setDrawerOpen(drawerStore, true);
}

function toggleStreamSettings() {
	_toggleSidebar('stream-settings');
}

function toggleChatMembers() {
	_toggleSidebar('members');
}

function toggleFiresideSettings() {
	_toggleSidebar('fireside-settings');
}

function _toggleSidebar(value: FiresideSidebar) {
	const result = sidebar.value === value ? 'chat' : value;
	sidebar.value = result;
}
</script>

<template>
	<AppTheme class="-bottom-bar" :force-dark="overlay">
		<div class="-bottom-bar-inner">
			<div v-if="canStream" class="-group -left">
				<AppFiresideBottomBarButton
					:active="localUser?.hasMicAudio && !producerMicMuted"
					:icon="micIcon"
					show-settings
					:disabled="!localUser?._micAudioTrack"
					@click-settings="toggleStreamSettings()"
					@click="onClickMic"
				/>
				<AppFiresideBottomBarButton
					:active="localUser?.hasVideo && !producerVideoMuted"
					:icon="videoIcon"
					show-settings
					:disabled="!localUser?._videoTrack"
					@click-settings="toggleStreamSettings()"
					@click="onClickVideo"
				/>
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
					icon="sticker-filled"
					:badge="stickerCount"
					:disabled="!canPlaceStickers"
					@click="onClickStickerButton"
				/>

				<AppFiresideBottomBarButton
					icon="users"
					:active="activeBottomBarControl === 'members'"
					@click="toggleChatMembers()"
				/>

				<AppFiresideBottomBarButton
					icon="ellipsis-h"
					:active="activeBottomBarControl === 'settings'"
					@click="toggleFiresideSettings()"
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
