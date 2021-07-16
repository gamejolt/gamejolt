import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppFiresideHostAvatar extends Vue {
	@Prop(propRequired(FiresideRTCUser)) host!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('change-host') emitChangeHost() {}

	onClick() {
		this.rtc.focusedUserId = this.host.userId;
		this.emitChangeHost();
	}
}
