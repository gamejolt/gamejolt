<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { useFiresideController } from '../../controller/controller';

@Options({})
export default class AppFiresideVideoStats extends Vue {
	c = shallowSetup(() => useFiresideController()!);

	private videoStats: any = {};
	private statsInterval?: NodeJS.Timer;

	get stats() {
		const stats: Record<string, any> = {
			[`Members`]: this.c.rtc.value?.listableStreamingUsers.length ?? 0,
		};

		const focusedId = this.c.rtc.value?.focusedUser?.uid;
		if (focusedId && this.videoStats[focusedId]) {
			Object.assign(stats, this.videoStats[focusedId]);
		}

		return stats;
	}

	mounted() {
		this.statsInterval = setInterval(() => {
			this.videoStats =
				this.c.rtc.value?.videoChannel.agoraClient.getRemoteVideoStats() ?? {};
		}, 3000);
	}
	beforeUnmount() {
		if (this.statsInterval) {
			clearInterval(this.statsInterval);
		}
	}
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
