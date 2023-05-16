<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, toRefs, watch } from 'vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { useFiresideController } from '../../controller/controller';

/**
 * A map of Agora stat keys to out prettier keys.
 */
const LOCAL_PRETTY_KEYS = {
	sendBytes: 'Sent bytes',
	sendBitrate: 'Outgoing bitrate',
	targetSendBitrate: 'Target bitrate',
	sendPacketsLost: 'Packets lost',
	currentPacketLossRate: 'Packet loss rate',
	codecType: 'Video codec',
	sendResolutionWidth: 'Output width',
	sendResolutionHeight: 'Output height',
	sendFrameRate: 'Output FPS',
	captureResolutionWidth: 'Capture width',
	captureResolutionHeight: 'Capture height',
	captureFrameRate: 'Capture FPS',
	totalFreezeTime: 'Frozen time',
	encodeDelay: 'Encode latency',
} as const;

const IGNORED_NUMBER_FORMATS: readonly string[] = [
	'sendResolutionWidth',
	'sendResolutionHeight',
	'sendFrameRate',
	'captureResolutionWidth',
	'captureResolutionHeight',
	'captureFrameRate',
] as const;

type StatsType = 'Video' | 'Desktop Audio' | 'Mic';

const props = defineProps({
	noAbs: {
		type: Boolean,
	},
	hasTabSwitcher: {
		type: Boolean,
	},
});

const { noAbs, hasTabSwitcher } = toRefs(props);

const {
	streamingHosts,
	focusedHost,
	isPersonallyStreaming,
} = useFiresideController()!;

const remoteVideoStats = shallowRef<{ [id: number]: any }>({});
const localVideoStats = shallowRef<{ [k: string]: any }>({});

const remoteDesktopAudioStats = shallowRef<{ [id: number]: any }>({});
const localDesktopAudioStats = shallowRef<{ [k: string]: any }>({});

const remoteMicStats = shallowRef<{ [id: number]: any }>({});
const localMicStats = shallowRef<{ [k: string]: any }>({});
let statsInterval: NodeJS.Timer | null = null;

const statType = ref<StatsType>('Video');

const tabs = computed(() => {
	const result: StatsType[] = [];

	const { hasVideo, hasDesktopAudio, hasMicAudio } = focusedHost.value || {};
	if (hasVideo) {
		result.push('Video');
	}
	if (hasDesktopAudio) {
		result.push('Desktop Audio');
	}
	if (hasMicAudio) {
		result.push('Mic');
	}

	return result;
});

watch(
	tabs,
	items => {
		if (!items.includes(statType.value)) {
			statType.value = items.length ? items[0] : 'Video';
		}
	},
	{ deep: true }
);

const isLocalStream = computed(() =>
	Boolean(focusedHost.value?.isMe && isPersonallyStreaming.value)
);

const stats = computed(() => {
	if (isLocalStream.value) {
		const uglyStats = Object.assign({}, localVideoStats.value);
		const prettyStats: Record<string, any> = {};

		for (const [uglyKey, prettyKey] of Object.entries(LOCAL_PRETTY_KEYS)) {
			let value = uglyStats[uglyKey];
			if (value === undefined) {
				continue;
			}

			if (typeof value === 'number' && !IGNORED_NUMBER_FORMATS.includes(uglyKey)) {
				value = Math.trunc(value * 1000) / 1000;
				value = formatNumber(value);
			}
			prettyStats[prettyKey] = value;
		}

		return prettyStats;
	}

	const stats: Record<string, any> = {
		[`Members`]: streamingHosts.value.length || 0,
	};

	const focusedId = focusedHost.value?.userId;
	if (!focusedId) {
		return stats;
	}

	let type = statType.value;
	if (!hasTabSwitcher.value) {
		type = 'Video';
	}

	switch (type) {
		case 'Video':
			Object.assign(stats, remoteVideoStats.value[focusedId]);
			break;

		case 'Desktop Audio':
			Object.assign(stats, remoteDesktopAudioStats.value[focusedId]);
			break;

		case 'Mic':
			Object.assign(stats, remoteMicStats.value[focusedId]);
			break;
	}

	return stats;
});

onMounted(() => {
	statsInterval = setInterval(updateVideoStats, 3000);

	updateVideoStats();
});

onUnmounted(() => {
	if (statsInterval) {
		clearInterval(statsInterval);
	}
});

function updateVideoStats() {
	// TODO(oven)
	return;
	// const videoClient = rtc.value?.videoChannel.agoraClient;
	// remoteVideoStats.value = videoClient?.getRemoteVideoStats() || {};
	// localVideoStats.value = videoClient?.getLocalVideoStats() || {};

	// if (!hasTabSwitcher.value) {
	// 	return;
	// }

	// remoteDesktopAudioStats.value = videoClient?.getRemoteAudioStats() || {};
	// localDesktopAudioStats.value = videoClient?.getLocalAudioStats() || {};

	// const chatClient = rtc.value?.chatChannel.agoraClient;
	// remoteMicStats.value = chatClient?.getRemoteAudioStats() || {};
	// localMicStats.value = chatClient?.getLocalAudioStats() || {};
}
</script>

<template>
	<div class="fireside-stream-stats" :class="{ '-abs': !noAbs }">
		<template v-if="!isLocalStream">
			<div v-if="hasTabSwitcher" class="-tab-bar">
				<a
					v-for="option of tabs"
					:key="option"
					:class="{ '-active': option === statType }"
					@click.capture="statType = option"
				>
					{{ option }}
				</a>
			</div>

			<table>
				<tbody>
					<tr v-for="(v, k) of stats" :key="k">
						<th>{{ k }}</th>
						<td>{{ typeof v === 'number' ? Math.round(v * 1000) / 1000 : v }}</td>
					</tr>
				</tbody>
			</table>
		</template>
		<div v-else class="-grid">
			<template v-for="(v, k) of stats" :key="k">
				<span class="-grid-key">
					{{ k }}
				</span>

				<span :title="v.length >= 12 ? v : undefined" class="-grid-value">
					{{ v }}
				</span>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-stream-stats
	rounded-corners()
	elevate-2()
	background-color: rgba($black, 0.7)
	padding: 12px
	color: $white
	text-overflow()

	table
		th
			text-align: right
			padding-right: 8px

	&.-abs
		position: absolute
		top: 12px
		left: 12px

.-grid
	display: grid
	justify-content: center
	gap: 4px 8px
	grid-template-columns: auto auto
	font-size: $font-size-small

.-grid-key
.-grid-value
	max-width: 100%
	text-overflow()

.-grid-key
	font-weight: bold
	justify-self: end

.-grid-value
	justify-self: start

.-tab-bar
	display: flex
	gap: 8px
	align-items: stretch
	margin-bottom: 12px

	> *
		padding: 6px 8px
		change-bg(bg-offset)
		rounded-corners()

		&.-active
			change-bg(primary)
			color: var(--theme-primary-fg)
</style>
