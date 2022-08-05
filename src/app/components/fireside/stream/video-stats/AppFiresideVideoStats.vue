<script lang="ts" setup>
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { useFiresideController } from '../../controller/controller';

const c = useFiresideController()!;

const videoStats = shallowRef<{ [id: number]: any }>({});
let statsInterval: NodeJS.Timer | null = null;

const stats = computed(() => {
	const stats: Record<string, any> = {
		[`Members`]: c.rtc.value?.listableStreamingUsers.length ?? 0,
	};

	const focusedId = c.rtc.value?.focusedUser?.uid;
	if (focusedId && videoStats.value[focusedId]) {
		Object.assign(stats, videoStats.value[focusedId]);
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
	videoStats.value = c.rtc.value?.videoChannel.agoraClient.getRemoteVideoStats() ?? {};
}
</script>

<template>
	<div class="-video-stats">
		<table>
			<tbody>
				<tr v-for="(v, k) of stats" :key="k">
					<th>{{ k }}</th>
					<td>{{ v }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="stylus" scoped>
.-video-stats
	rounded-corners()
	elevate-2()
	position: absolute
	top: 12px
	left: 12px
	background-color: rgba($black, 0.7)
	padding: 12px
	color: $white

	table
		th
			text-align: right
			padding-right: 8px
</style>
