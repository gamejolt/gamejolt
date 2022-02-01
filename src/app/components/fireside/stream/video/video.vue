<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import {
	FiresideRTCUser,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../../../../../_common/fireside/rtc/user';
import { useFiresideController } from '../../controller/controller';

@Options({})
export default class AppFiresideStreamVideo extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean })
	lowBitrate!: boolean;

	c = shallowSetup(() => useFiresideController()!);

	private myRtcUser!: FiresideRTCUser;
	private videoLock: FiresideVideoLock | null = null;

	declare $refs: {
		video: HTMLDivElement;
		canvas: HTMLCanvasElement;
	};

	get hasVideo() {
		return this.myRtcUser.hasVideo;
	}

	get pausedFrameData() {
		if (this.shouldPlayVideo) {
			return null;
		}
		return this.myRtcUser.pausedFrameData;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc.value?.videoChannel.isConnected !== true;
	}

	get shouldPlayVideo() {
		return this.c.rtc.value?.videoPaused !== true;
	}

	created() {
		this.myRtcUser = this.rtcUser;
	}

	mounted() {
		this.onShouldPlayVideoChange();
		this.onFrameDataChange();
	}

	unmounted() {
		this.releaseLocks();
	}

	private getLocks() {
		this.videoLock = getVideoLock(this.myRtcUser);
		setVideoPlayback(
			this.myRtcUser,
			new FiresideVideoPlayStatePlaying(this.$refs.video, this.lowBitrate)
		);
	}

	private releaseLocks() {
		// We want to give a new lock some time to get acquired before shutting
		// the stream down.
		setTimeout(() => {
			if (this.videoLock) {
				releaseVideoLock(this.myRtcUser, this.videoLock);
			}
		}, 0);
	}

	@Watch('pausedFrameData')
	private onFrameDataChange() {
		if (this.pausedFrameData) {
			const {
				$refs: { canvas },
				pausedFrameData: { width, height },
			} = this;

			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d')!;
			context.clearRect(0, 0, width, height);
			context.putImageData(this.pausedFrameData, 0, 0, 0, 0, width, height);
		}
	}

	@Watch('shouldPlayVideo')
	private onShouldPlayVideoChange() {
		if (this.shouldPlayVideo) {
			this.getLocks();
		} else {
			this.releaseLocks();
		}
	}
}
</script>

<template>
	<div class="-video-player">
		<div ref="video" />
		<canvas v-show="!shouldPlayVideo" ref="canvas" />
	</div>
</template>

<style lang="stylus" scoped>
.-video-player
	position: relative

	&
	> *
		width: 100%
		height: 100%

	> *
		position: absolute
</style>
