import { Inject, Options, Vue } from 'vue-property-decorator';
import { FiresideController, FiresideControllerKey } from '../../controller/controller';

@Options({})
export default class AppFiresideVideoStats extends Vue {
	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	private videoStats: any = {};
	private statsInterval?: NodeJS.Timer;

	get stats() {
		const stats: Record<string, any> = {
			[`Members`]: this.c.rtc?.users.length ?? 0,
		};

		const focusedId = this.c.rtc?.focusedUser?.uid;
		if (focusedId && this.videoStats[focusedId]) {
			Object.assign(stats, this.videoStats[focusedId]);
		}

		return stats;
	}

	mounted() {
		this.statsInterval = setInterval(() => {
			this.videoStats = this.c.rtc?.videoChannel.agoraClient.getRemoteVideoStats() ?? {};
		}, 3000);
	}

	beforeUnmount() {
		if (this.statsInterval) {
			clearInterval(this.statsInterval);
		}
	}
}
