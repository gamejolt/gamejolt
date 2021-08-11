import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { ChatUserCollection } from '../../../components/chat/user-collection';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import { FiresideRTCUser } from '../fireside-rtc-user';
import AppFiresideDesktopAudio from '../_desktop_audio/desktop-audio.vue';
import AppFiresideHostList from '../_host-list/host-list.vue';
import AppFiresideHostThumbIndicator from '../_host-thumb/host-thumb-indicator.vue';
import AppFiresideVideoStats from '../_video-stats/video-stats.vue';
import AppFiresideVideo from '../_video/video.vue';

const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
const UITransitionTime = 200;
@Component({
	components: {
		AppFiresideHostList,
		AppFiresideHostThumbIndicator,
		AppLoading,
		AppFiresideVideo,
		AppFiresideDesktopAudio,
		AppFiresideVideoStats,
	},
})
export default class AppFiresideStream extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	showHosts!: boolean;

	@Prop({ type: ChatUserCollection, required: false, default: null })
	members!: ChatUserCollection | null;

	@Inject({ from: FiresideRTCKey })
	rtc!: FiresideRTC;

	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;
	private _ignorePointerTimer?: NodeJS.Timer;
	private isShowingOverlayPopper = false;

	readonly Screen = Screen;
	readonly number = number;

	get shouldShowUI() {
		if (GJ_IS_SSR) {
			return false;
		}

		return (
			(this.hasVideo && this.videoPaused) ||
			this.isShowingOverlayPopper ||
			this.isHovered ||
			this._hideUITimer
		);
	}

	get hasOverlayItems() {
		return this.showHosts || !!this.members;
	}

	get memberCount() {
		return this.members?.count;
	}

	get videoPaused() {
		return this.rtc.videoPaused;
	}

	get hasVideo() {
		return this.rtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.rtc.videoClient?.connectionState !== 'CONNECTED';
	}

	get shouldPlayDesktopAudio() {
		return (
			this.hasVideo &&
			this.rtc.videoClient?.connectionState === 'CONNECTED' &&
			this.rtcUser.hasDesktopAudio
		);
	}

	get shouldShowOverlayPlayback() {
		return this.hasVideo;
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	onVideoClick() {
		this.scheduleUIHide(UIHideTimeout);

		// Don't alter video playback here when we have overlays to use tap
		// interactions with.
		if (this.hasOverlayItems) {
			return;
		}

		this.togglePlayback();
	}

	onOverlayTap(event: Event) {
		if (this._ignorePointerTimer) {
			event.stopImmediatePropagation();
		}
	}

	togglePlayback() {
		if (this.videoPaused) {
			this.pauseVideo();
		} else {
			this.unpauseVideo();
		}
	}

	onHostOptionsShow() {
		this.isShowingOverlayPopper = true;
	}

	onHostOptionsHide() {
		this.isShowingOverlayPopper = false;
	}

	private scheduleUIHide(delay: number) {
		if (!this.shouldShowUI) {
			this.startIgnoringPointer();
		}

		this.isHovered = true;
		this.clearHideUITimer();
		this._hideUITimer = setTimeout(() => {
			this.isHovered = false;
			this.clearHideUITimer();
		}, delay);
	}

	private clearHideUITimer() {
		if (!this._hideUITimer) {
			return;
		}

		clearTimeout(this._hideUITimer);
		this._hideUITimer = undefined;
	}

	private startIgnoringPointer() {
		this.clearPointerIgnore();
		this._ignorePointerTimer = setTimeout(() => {
			this.clearPointerIgnore();
		}, UITransitionTime);
	}

	private clearPointerIgnore() {
		if (!this._ignorePointerTimer) {
			return;
		}

		clearTimeout(this._ignorePointerTimer);
		this._ignorePointerTimer = undefined;
	}

	private pauseVideo() {
		this.rtc.videoPaused = false;
	}

	private unpauseVideo() {
		this.rtc.videoPaused = true;
	}
}
