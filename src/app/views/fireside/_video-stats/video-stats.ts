import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { FiresideController, FiresideControllerKey } from '../controller/controller';

@Component({})
export default class AppFiresideVideoStats extends Vue {
	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	private videoStats: any = {};
	private statsInterval?: NodeJS.Timer;

	get stats() {
		const stats: Record<string, any> = {
			[`Members`]: this.c.rtc?.users.length ?? 0,
		};

		const focusedId = this.c.rtc?.focusedUser?.userId;
		if (focusedId && this.videoStats[focusedId]) {
			Object.assign(stats, this.videoStats[focusedId]);
		}

		return stats;
	}

	mounted() {
		this.statsInterval = setInterval(() => {
			this.videoStats = this.c.rtc?.videoClient?.getRemoteVideoStats() ?? {};
		}, 3000);
	}

	beforeDestroy() {
		if (this.statsInterval) {
			clearInterval(this.statsInterval);
		}
	}
}
