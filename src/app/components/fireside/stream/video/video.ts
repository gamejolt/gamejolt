import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../../../../../_common/fireside/rtc/user';
import { FiresideController, FiresideControllerKey } from '../../controller/controller';

@Options({})
export default class AppFiresideStreamVideo extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean })
	lowBitrate!: boolean;

	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	private _myRtcUser!: FiresideRTCUser;
	private _videoLock: FiresideVideoLock | null = null;

	declare $refs: {
		video: HTMLDivElement;
		canvas: HTMLCanvasElement;
	};

	get hasVideo() {
		return this._myRtcUser.hasVideo;
	}

	get pausedFrameData() {
		if (this.shouldPlayVideo) {
			return null;
		}
		return this._myRtcUser.pausedFrameData;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc?.videoChannel.isConnected !== true;
	}

	get shouldPlayVideo() {
		return this.c.rtc?.videoPaused !== true;
	}

	created() {
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		this.onShouldPlayVideoChange();
		this.onFrameDataChange();
	}

	unmounted() {
		this.releaseLocks();
	}

	private getLocks() {
		this._videoLock = getVideoLock(this._myRtcUser);
		setVideoPlayback(
			this._myRtcUser,
			new FiresideVideoPlayStatePlaying(this.$refs.video, this.lowBitrate)
		);
	}

	private releaseLocks() {
		// We want to give a new lock some time to get acquired before shutting
		// the stream down.
		setTimeout(() => {
			if (this._videoLock) {
				releaseVideoLock(this._myRtcUser, this._videoLock);
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
