import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';
import AppFiresideHostThumbIndicator from './host-thumb-indicator.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppFiresideHostThumbIndicator,
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

	get hasDisplay() {
		return !this.isFocused;
	}

	onClick() {
		if (this.isFocused) {
			return;
		}

		this.rtc.focusedUserId = this.host.userId;
		this.emitChangeHost();
	}
}
