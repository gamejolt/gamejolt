<script lang="ts" setup>
import { useFiresideController } from '../../controller/controller';
import { computed, onMounted, onUnmounted } from 'vue';

const c = useFiresideController()!;

let videoStats: any = {};
let statsInterval: NodeJS.Timer | null = null;

const stats = computed(() => {
	const stats: Record<string, any> = {
		[`Members`]: c.rtc.value?.listableStreamingUsers.length ?? 0,
	};

	const focusedId = c.rtc.value?.focusedUser?.uid;
	if (focusedId && videoStats[focusedId]) {
		Object.assign(stats, videoStats[focusedId]);
	}

	return stats;
});

onMounted(() => {
	statsInterval = setInterval(() => {
		videoStats = c.rtc.value?.videoChannel.agoraClient.getRemoteVideoStats() ?? {};
	}, 3000);
});

onUnmounted(() => {
	if (statsInterval) {
		clearInterval(statsInterval);
	}
});
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
