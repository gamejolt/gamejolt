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
	testBg: () => true,
});

const c = useFiresideController()!;
const { rtc, user, canStream, isStreaming, isPersonallyStreaming } = c;

const drawerStore = useDrawerStore();

const canPlaceStickers = computed(() => !!user.value && !Screen.isMobile && isStreaming.value);

const producer = computed(() => rtc.value?.producer);
const localUser = computed(() => rtc.value?.localUser);

const stickerCount = computed(() => {
	const length = c.stickerTargetController.stickers.value.length;
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
	if (!_user || !_user._micAudioTrack || _user.micAudioMuted) {
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
	if (!_user || !_user._videoTrack || _user.videoMuted) {
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

	if (!_user.hasVideo || _user.videoMuted) {
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

	if (!_user.hasMicAudio || _user.micAudioMuted) {
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
			<div class="-group -left">
				<template v-if="canStream">
					<AppFiresideBottomBarButton
						v-if="!isPersonallyStreaming"
						:active="activeControl === 'setup'"
						icon="broadcast"
						@click="emit('streamSettings')"
					/>
					<template v-else>
						<AppFiresideBottomBarButton
							:active="localUser?.hasMicAudio && !localUser.micAudioMuted"
							:icon="micIcon"
							show-settings
							:disabled="!localUser?._micAudioTrack"
							@click-settings="emit('streamSettings')"
							@click="onClickMic"
						/>
						<AppFiresideBottomBarButton
							:active="localUser?.hasVideo && !localUser.videoMuted"
							:icon="videoIcon"
							show-settings
							:disabled="!localUser?._videoTrack"
							@click-settings="emit('streamSettings')"
							@click="onClickVideo"
						/>
					</template>
				</template>
			</div>

			<AppScrollScroller v-if="rtc" class="-host-scroller" horizontal>
				<div class="-group">
					<AppFiresideBottomBarHosts />
				</div>
			</AppScrollScroller>

			<div class="-group -right">
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
				<!-- TODO(fireside-redesign-3) remove -->
				<AppFiresideBottomBarButton icon="bolt-unfilled" @click="emit('testBg')" />
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-bottom-bar-inner
.-hosts
.-group
	display: flex
	align-items: center
	justify-content: center

.-bottom-bar
	width: 100%
	padding: 0 16px

.-host-scroller
	margin: 0 20px

.-group
	gap: 8px
	padding-bottom: 16px

.-left
.-right
	flex: 1 0

.-left
	justify-content: end

.-right
	justify-content: start
</style>
