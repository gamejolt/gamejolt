import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';
import AppFiresideHostThumbIndicator from './host-thumb-indicator.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppFiresideHostThumbIndicator,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHostThumb extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	host!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('change-host') emitChangeHost() {}

	get isFocused() {
		return this.rtc.focusedUserId === this.host.userId;
	}

	get showingVideoThumb() {
		return !this.isFocused && this.host.hasVideo;
	}

	get tooltip() {
		return '@' + this.host.userModel?.username;
	}

	onClick() {
		if (this.isFocused) {
			return;
		}

		this.rtc.focusedUserId = this.host.userId;
		this.emitChangeHost();
	}
}
