import OvenPlayerStatic, { OvenPlayer } from 'ovenplayer';
import { computed, markRaw, onMounted, onUnmounted, ref, shallowReadonly, shallowRef } from 'vue';
import { FiresideHost } from '../../../../../_common/fireside/rtc/host';
import { Logger } from '../../../../../utils/logging';

export function createFiresideStreamHostPlayer({
	host,
	playerType,
	logger,
}: {
	host: FiresideHost;
	playerType: 'video' | 'chat';
	logger: Logger;
}) {
	const _isPlayerReady = ref(false);
	const _player = shallowRef<OvenPlayer | null>(null);
	const playerElem = ref<HTMLDivElement>();

	const readyPlayer = computed(() => (_isPlayerReady.value && _player.value) || null);

	onMounted(() => {
		if (
			(playerType === 'video' && host._videoPlayer) ||
			(playerType === 'chat' && host._chatPlayer)
		) {
			throw new Error(`Already have ${playerType} player for ${host.userId}!`);
		}

		// We will handle setting up the player in the "ready" event. At that
		// point we'll be able to make calls to the instance without errors.
		_player.value = markRaw(
			OvenPlayerStatic.create(playerElem.value!, {
				autoFallback: false,
				autoStart: true,
				mute: true,
				sources:
					playerType === 'video'
						? [
								{
									label: 'WebRTC',
									type: 'webrtc',
									file: `wss://stream-edge-01.development.gamejolt.com:3334/video/${host.userId}/abr?transport=tcp`,
								},
								// {
								// 	label: 'LLHLS',
								// 	type: 'hls',
								// 	file: `https://stream-edge-01.development.gamejolt.com:3334/video/${rtcUser.userId}/abr.m3u8`,
								// },
						  ]
						: [
								{
									label: 'WebRTC',
									type: 'webrtc',
									file: `wss://stream-edge-01.development.gamejolt.com:3334/chat/${host.userId}?transport=tcp`,
								},
						  ],
			})
		);

		_player.value.on('ready', () => {
			logger.info(`Video player ready for user: `, host.userId);
			_isPlayerReady.value = true;
		});

		if (playerType === 'video') {
			host._videoPlayer = _player.value;
		} else if (playerType === 'chat') {
			host._chatPlayer = _player.value;
		}
	});

	onUnmounted(() => {
		_player.value?.remove();

		if (playerType === 'video') {
			host._videoPlayer = null;
		} else if (playerType === 'chat') {
			host._chatPlayer = null;
		}
	});

	return shallowReadonly({
		player: readyPlayer,
		playerElem,
	});
}
