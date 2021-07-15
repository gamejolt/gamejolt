import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';
import AppFiresideHostList from '../_host-list/host-list.vue';

const UIHideTimeout = 2000;
const UIHideTimeoutMovement = 2000;
@Component({
	components: {
		AppFiresideHostList,
	},
})
export default class AppFiresideVideo extends Vue {
	@Prop(propRequired(FiresideRTCUser)) rtcUser!: FiresideRTCUser;
	@Prop(propOptional(Boolean, false)) showHosts!: boolean;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	isHoveringControls = false;
	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;

	readonly Screen = Screen;

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
		return this.showHosts;
	}

	mounted() {
		this.rtcUser.startVideoPlayback(this.rtc, this.$refs.player);
	}

	beforeDestroy() {
		this.rtcUser.stopVideoPlayback(this.rtc);
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
}
