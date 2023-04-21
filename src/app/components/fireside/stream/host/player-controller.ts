import OvenPlayerStatic, { OvenPlayer } from 'ovenplayer';
import { computed, markRaw, onMounted, onUnmounted, ref, shallowReadonly, shallowRef } from 'vue';
import { FiresideRTCUser } from '../../../../../_common/fireside/rtc/user';

export function createFiresideStreamHostPlayer(
	rtcUser: FiresideRTCUser,
	playerType: 'video' | 'chat'
) {
	const _isPlayerReady = ref(false);
	const _player = shallowRef<OvenPlayer | null>(null);
	const playerElem = ref<HTMLDivElement>();

	const readyPlayer = computed(() => (_isPlayerReady.value && _player.value) || null);

	onMounted(() => {
		if (!rtcUser.isRemote) {
			throw new Error(`Host players only work for remote users.`);
		}

		if (
			(playerType === 'video' && rtcUser._videoPlayer) ||
			(playerType === 'chat' && rtcUser._chatPlayer)
		) {
			throw new Error(`Already have ${playerType} player for ${rtcUser.userId}!`);
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
									file: `wss://stream-edge-01.development.gamejolt.com:3334/video/${rtcUser.userId}/abr?transport=tcp`,
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
									file: `wss://stream-edge-01.development.gamejolt.com:3334/chat/${rtcUser.userId}?transport=tcp`,
								},
						  ],
			})
		);

		_player.value.on('ready', () => {
			rtcUser.rtc.log(`Video player ready for user: `, rtcUser.userId);
			_isPlayerReady.value = true;
		});

		if (playerType === 'video') {
			rtcUser._videoPlayer = _player.value;
		} else if (playerType === 'chat') {
			rtcUser._chatPlayer = _player.value;
		}
	});

	onUnmounted(() => {
		_player.value?.remove();

		if (playerType === 'video') {
			rtcUser._videoPlayer = null;
		} else if (playerType === 'chat') {
			rtcUser._chatPlayer = null;
		}
	});

	return shallowReadonly({
		player: readyPlayer,
		playerElem,
	});
}
