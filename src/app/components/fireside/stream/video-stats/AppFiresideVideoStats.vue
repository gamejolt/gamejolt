<script lang="ts" setup>
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
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

defineProps({
	noAbs: {
		type: Boolean,
	},
});

const { rtc } = useFiresideController()!;

const remoteVideoStats = shallowRef<{ [id: number]: any }>({});
const localVideoStats = shallowRef<{ [k: string]: any }>({});
let statsInterval: NodeJS.Timer | null = null;

const focusedUser = computed(() => rtc.value?.focusedUser);

const stats = computed(() => {
	const user = focusedUser.value;
	if (user?.isLocal) {
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
		[`Members`]: rtc.value?.listableStreamingUsers.length ?? 0,
	};

	const focusedId = user?.uid;
	if (focusedId && remoteVideoStats.value[focusedId]) {
		Object.assign(stats, remoteVideoStats.value[focusedId]);
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
	const client = rtc.value?.videoChannel.agoraClient;

	remoteVideoStats.value = client?.getRemoteVideoStats() || {};
	localVideoStats.value = client?.getLocalVideoStats() || {};
}
</script>

<template>
	<div class="-video-stats" :class="{ '-abs': !noAbs }">
		<table v-if="!focusedUser?.isLocal">
			<tbody>
				<tr v-for="(v, k) of stats" :key="k">
					<th>{{ k }}</th>
					<td>{{ typeof v === 'number' ? Math.round(v * 1000) / 1000 : v }}</td>
				</tr>
			</tbody>
		</table>
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
.-video-stats
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
</style>
