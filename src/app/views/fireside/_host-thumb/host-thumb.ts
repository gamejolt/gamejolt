import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';

@Component({
	components: {
		AppUserAvatarImg,
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

	get talking() {
		// Make a nice looking curve, have it snap to a small number of positions.
		const volumeAdjusted =
			Math.pow(Math.log10(this.host.volumeLevel * 100 + 1), 1.5) /
			Math.pow(Math.log10(101), 1.5);

		const accuracy = 7;
		const volumeSnapped = Math.round(volumeAdjusted * accuracy) / accuracy;
		return Math.min(1, Math.max(0, volumeSnapped));
	}

	onClick() {
		if (this.isFocused) {
			this.rtc.focusedUserId = null;
		} else {
			this.rtc.focusedUserId = this.host.userId;
		}
		this.emitChangeHost();
	}
}
