<script lang="ts" setup>
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { useFiresideController } from '../../controller/controller';

defineProps({
	noAbs: {
		type: Boolean,
	},
});

const c = useFiresideController()!;

const remoteVideoStats = shallowRef<{ [id: number]: any }>({});
const localVideoStats = shallowRef<{ [k: string]: any }>({});
let statsInterval: NodeJS.Timer | null = null;

const stats = computed(() => {
	const stats: Record<string, any> = {
		[`Members`]: c.rtc.value?.listableStreamingUsers.length ?? 0,
	};

	const user = c.rtc.value?.focusedUser;
	if (user?.isLocal) {
		Object.assign(stats, localVideoStats.value);
	} else {
		const focusedId = user?.uid;
		if (focusedId && remoteVideoStats.value[focusedId]) {
			Object.assign(stats, remoteVideoStats.value[focusedId]);
		}
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
	const client = c.rtc.value?.videoChannel.agoraClient;

	remoteVideoStats.value = client?.getRemoteVideoStats() || {};
	localVideoStats.value = client?.getLocalVideoStats() || {};
}
</script>

<template>
	<div class="-video-stats" :class="{ '-abs': !noAbs }">
		<table>
			<tbody>
				<tr v-for="(v, k) of stats" :key="k">
					<th>{{ k }}</th>
					<td>{{ typeof v === 'number' ? Math.round(v * 1000) / 1000 : v }}</td>
				</tr>
			</tbody>
		</table>
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
</style>
