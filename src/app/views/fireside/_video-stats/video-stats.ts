import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';

@Component({})
export default class AppFiresideVideoStats extends Vue {
	@Inject({ from: FiresideRTCKey })
	rtc!: FiresideRTC;

	private videoStats: any = {};
	private statsInterval?: NodeJS.Timer;

	get stats() {
		const stats: Record<string, any> = {
			[`Members`]: this.rtc.users.length,
		};

		const focusedId = this.rtc.focusedUser?.userId;
		if (focusedId && this.videoStats[focusedId]) {
			Object.assign(stats, this.videoStats[focusedId]);
		}

		return stats;
	}

	mounted() {
		this.statsInterval = setInterval(() => {
			this.videoStats = this.rtc.videoClient?.getRemoteVideoStats() ?? {};
		}, 3000);
	}

	beforeDestroy() {
		if (this.statsInterval) {
			clearInterval(this.statsInterval);
		}
	}
}
