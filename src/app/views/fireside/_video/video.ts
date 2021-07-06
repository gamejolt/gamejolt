import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { FiresideRTCUser } from '../fireside-rtc';

@Component({})
export default class AppFiresideVideo extends Vue {
	@Prop(propRequired(FiresideRTCUser)) rtcUser!: FiresideRTCUser;

	$refs!: {
		player: HTMLDivElement;
	};

	@Watch('rtcUser.videoTrack', { immediate: true })
	async onVideoTrackChange() {
		await this.$nextTick();
		this.rtcUser.videoTrack?.agoraTrack.play(this.$refs.player);
	}

	beforeDestroy() {
		this.rtcUser.agoraUser.videoTrack?.stop();
		this.$refs.player.innerHTML = '';
	}
}
