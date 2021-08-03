import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
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

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	isHoveringControls = false;
	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;
	private _ignorePointerTimer?: NodeJS.Timer;

	readonly Screen = Screen;
	readonly number = number;

	get shouldShowUI() {
		if (GJ_IS_SSR) {
			return false;
		}

		return this.isHoveringControls || this.isHovered || this._hideUITimer;
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

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	onVideoClick() {
		if (this.videoPaused) {
			this.pauseVideo();
		} else {
			this.unpauseVideo();
		}

		this.scheduleUIHide(UIHideTimeout);
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

	onTapOverlay(event: Event) {
		if (this._ignorePointerTimer) {
			event.stopImmediatePropagation();
		}
	}

	pauseVideo() {
		this.rtc.videoPaused = false;
	}

	unpauseVideo() {
		this.rtc.videoPaused = true;
	}
}
