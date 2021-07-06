import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';

@Component({})
export default class AppFiresideHostAvatar extends Vue {
	@Prop(propRequired(FiresideRTCUser)) host!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	onClick() {
		this.rtc.focusedUser = this.host;
	}
}
