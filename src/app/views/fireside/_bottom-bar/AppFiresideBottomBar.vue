<script lang="ts">
export type BottomBarControl = 'members' | 'settings' | 'setup';
</script>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { setDrawerOpen, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { setProducerDeviceMuted, stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarButton from './AppFiresideBottomBarButton.vue';
import AppFiresideBottomBarHosts from './AppFiresideBottomBarHosts.vue';

defineProps({
	overlay: {
		type: Boolean,
	},
	activeControl: {
		type: String as PropType<BottomBarControl>,
		default: undefined,
	},
});

const emit = defineEmits({
	members: () => true,
	firesideSettings: () => true,
	streamSettings: () => true,
});

const c = useFiresideController()!;
const { rtc, user, canStream, isStreaming, isPersonallyStreaming } = c;

const drawerStore = useDrawerStore();

const canPlaceStickers = computed(() => !!user.value && !Screen.isMobile && isStreaming.value);

const producer = computed(() => rtc.value?.producer);
const localUser = computed(() => rtc.value?.localUser);

const producerMicMuted = computed(() => producer.value?.micMuted.value === true);
const producerVideoMuted = computed(() => producer.value?.videoMuted.value === true);

const stickerCount = computed(() => {
	// StickerTargetController adds/removes from the list of stickers all the
	// time when in a Live context. Just get the counts from the model directly.
	const length = c.stickerTargetController.model.sticker_counts.reduce(
		(prev, current) => prev + current.count,
		0
	);

	if (!length) {
		return undefined;
	}
	return formatFuzzynumber(length).toString();
});

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
		emit('streamSettings');
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
		emit('streamSettings');
	}
}

async function onClickVideo() {
	const _producer = producer.value;

	if (!_producer) {
		return;
	}

	if (!isPersonallyStreaming.value) {
		emit('streamSettings');
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
		emit('streamSettings');
	}
}

function onClickStickerButton() {
	setDrawerOpen(drawerStore, true);
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
					@click-settings="emit('streamSettings')"
					@click="onClickMic"
				/>
				<AppFiresideBottomBarButton
					:active="localUser?.hasVideo && !producerVideoMuted"
					:icon="videoIcon"
					show-settings
					:disabled="!localUser?._videoTrack"
					@click-settings="emit('streamSettings')"
					@click="onClickVideo"
				/>
			</div>

			<div v-if="rtc" class="-hosts">
				<AppScrollScroller horizontal>
					<div class="-group">
						<AppFiresideBottomBarHosts @stream-settings="emit('streamSettings')" />
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
					:active="activeControl === 'members'"
					@click="emit('members')"
				/>

				<AppFiresideBottomBarButton
					icon="ellipsis-h"
					:active="activeControl === 'settings'"
					@click="emit('firesideSettings')"
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
