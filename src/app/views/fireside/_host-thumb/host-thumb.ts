import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTCUser, setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import AppFiresideVideo from '../_video/video.vue';
import AppFiresideHostThumbIndicator from './host-thumb-indicator.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppFiresideHostThumbIndicator,
		AppPopper,
		AppFiresideVideo,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHostThumb extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	host!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	hideOptions!: boolean;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get isFocused() {
		return this.c.rtc?.focusedUser === this.host;
	}

	get showingVideoThumb() {
		return !this.isFocused && this.host.hasVideo;
	}

	get tooltip() {
		return '@' + this.host.userModel?.username;
	}

	onClick() {
		if (this.isFocused || !this.c.rtc) {
			return;
		}

		this.c.rtc.focusedUser = this.host;
	}

	mute() {
		setAudioPlayback(this.host, false);
	}

	unmute() {
		setAudioPlayback(this.host, true);
	}

	onUserCardShow() {
		this.c.isShowingOverlayPopper = true;
	}

	onUserCardHide() {
		this.c.isShowingOverlayPopper = false;
	}
}
