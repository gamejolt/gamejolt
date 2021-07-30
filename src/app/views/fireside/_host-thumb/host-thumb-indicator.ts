import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppFiresideHostThumbIndicator extends Vue {
	@Prop({ type: FiresideRTCUser, required: true }) host!: FiresideRTCUser;
	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	get padding() {
		// Make a nice looking curve, have it snap to a small number of positions.
		const volumeAdjusted =
			Math.pow(Math.log10(this.host.volumeLevel * 100 + 1), 1.5) /
			Math.pow(Math.log10(101), 1.5);

		const accuracy = 7;
		const volumeSnapped = Math.round(volumeAdjusted * accuracy) / accuracy;
		const clamped = Math.min(1, Math.max(0, volumeSnapped)) * 5;
		return `calc( max( ${clamped}px, ${clamped}% ))`;
	}
}
