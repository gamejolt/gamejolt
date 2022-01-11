import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { DrawerStore, DrawerStoreKey } from '../../../../_common/drawer/drawer-store';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../_common/filters/number';
import { setRTCDesktopVolume } from '../../../../_common/fireside/rtc/rtc';
import { FiresideRTCUser } from '../../../../_common/fireside/rtc/user';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { ScrubberCallback } from '../../../../_common/slider/slider';
import AppSlider from '../../../../_common/slider/slider.vue';
import AppSticker from '../../../../_common/sticker/sticker.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import AppFiresideDesktopAudio from '../../../components/fireside/stream/desktop-audio/desktop-audio.vue';
import AppFiresideVideoStats from '../../../components/fireside/stream/video-stats/video-stats.vue';
import AppFiresideVideo from '../../../components/fireside/stream/video/video.vue';
import AppFiresideHeader from '../_header/header.vue';
import AppFiresideHostList from '../_host-list/host-list.vue';
import AppFiresideHostThumbIndicator from '../_host-thumb/host-thumb-indicator.vue';

const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
const UITransitionTime = 200;

@Options({
	components: {
		AppFiresideDesktopAudio,
		AppFiresideHeader,
		AppFiresideHostList,
		AppFiresideHostThumbIndicator,
		AppFiresideVideo,
		AppFiresideVideoStats,
		AppLoading,
		AppSlider,
		AppSticker,
	},
})
export default class AppFiresideStream extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean })
	hasHeader!: boolean;

	@Prop({ type: Boolean })
	hasHosts!: boolean;

	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	@Inject({ from: DrawerStoreKey })
	drawerStore!: DrawerStore;

	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;
	private _ignorePointerTimer?: NodeJS.Timer;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	streakTimer: NodeJS.Timer | null = null;
	hasQueuedStreakAnimation = false;
	shouldAnimateStreak = false;

	declare $refs: {
		paused?: HTMLDivElement;
	};

	get stickerStreak() {
		return this.drawerStore.streak;
	}

	get streakCount() {
		return formatFuzzynumber(this.stickerStreak?.count ?? 0);
	}

	get desktopVolume() {
		return this.c.rtc?.desktopVolume ?? 1;
	}

	get hasVolumeControls() {
		return !!this.c.rtc?.shouldShowVolumeControls;
	}

	get shouldShowUI() {
		if (import.meta.env.SSR) {
			return false;
		}

		return !!(
			(this.hasVideo && this.videoPaused) ||
			this.c.isShowingOverlayPopper ||
			this.isHovered ||
			this._hideUITimer
		);
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return !(this.c.isShowingStreamSetup && this.c.rtc?.isFocusingMe);
	}

	get hasOverlayItems() {
		return this.hasVideo || this.hasVolumeControls || this.hasHeader;
	}

	get memberCount() {
		return this.c.chatUsers?.count ?? 1;
	}

	get videoPaused() {
		return this.c.rtc?.videoPaused === true;
	}

	get hasVideo() {
		return this.rtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc?.videoChannel.isConnected !== true;
	}

	// When we want to darken the whole stream overlay instead of only sections.
	get shouldDarkenAll() {
		if (!this.shouldShowUI) {
			return false;
		}

		// If we're displaying any of this large content, or we're paused,
		// darken the whole overlay instead of individual rows.
		return this.videoPaused || this.hasHeader || this.hasHosts;
	}

	get shouldPlayDesktopAudio() {
		if (!this.c.rtc) {
			return false;
		}

		return (
			this.hasVideo &&
			this.c.rtc.videoChannel.isConnected &&
			this.rtcUser.hasDesktopAudio &&
			!this.c.rtc.videoPaused
		);
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	onVideoClick(event: Event) {
		this.scheduleUIHide(UIHideTimeout);

		if (event.target === this.$refs.paused) {
			this.togglePlayback();
		}
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
		this.c.isShowingOverlayPopper = true;
	}

	onHostOptionsHide() {
		this.c.isShowingOverlayPopper = false;
	}

	onVolumeScrub({ percent }: ScrubberCallback) {
		setRTCDesktopVolume(this.c.rtc!, percent);
	}

	private animateStickerStreak() {
		if (!this.streakCount) {
			this.clearStreakTimer();
			return;
		}

		if (this.streakTimer != null) {
			this.hasQueuedStreakAnimation = true;
			return;
		}

		this.shouldAnimateStreak = true;
		this.streakTimer = setTimeout(() => {
			this.clearStreakTimer();
			if (this.hasQueuedStreakAnimation) {
				this.hasQueuedStreakAnimation = false;
				this.animateStickerStreak();
				return;
			}

			this.shouldAnimateStreak = false;
		}, 2_000);
	}

	private clearStreakTimer() {
		if (this.streakTimer) {
			clearTimeout(this.streakTimer);
		}
		this.streakTimer = null;
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
		this.c.rtc!.videoPaused = false;
	}

	private unpauseVideo() {
		this.c.rtc!.videoPaused = true;
	}

	@Watch('shouldShowUI', { immediate: true })
	onShouldShowUIChanged() {
		this.c.isShowingStreamOverlay = this.shouldShowUI;
	}

	@Watch('stickerStreak')
	onStreakCountChanged() {
		if (this.stickerStreak) {
			this.animateStickerStreak();
		}
	}
}
