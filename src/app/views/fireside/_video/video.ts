import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { ChatUserCollection } from '../../../components/chat/user-collection';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import {
	deregisterVideoPlaybackElement,
	FiresideRTCUser,
	registerVideoPlaybackElement,
} from '../fireside-rtc-user';
import AppFiresideHostList from '../_host-list/host-list.vue';
import AppFiresideHostThumbIndicator from '../_host-thumb/host-thumb-indicator.vue';

const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
const UITransitionTime = 200;
@Component({
	components: {
		AppFiresideHostList,
		AppFiresideHostThumbIndicator,
		AppLoading,
	},
})
export default class AppFiresideVideo extends Vue {
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
	private _myRtcUser!: FiresideRTCUser;

	readonly Screen = Screen;
	readonly number = number;

	$refs!: {
		player: HTMLDivElement;
	};

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

	get hasVideo() {
		return this.rtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.rtc.videoClient?.connectionState !== 'CONNECTED';
	}

	created() {
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		registerVideoPlaybackElement(this.rtcUser, this.$refs.player, false);
	}

	beforeDestroy() {
		deregisterVideoPlaybackElement(this._myRtcUser, this.$refs.player);
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	onVideoClick() {
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
}
