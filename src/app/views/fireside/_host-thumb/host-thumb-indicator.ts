import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTCUser } from '../../../../_common/fireside/rtc/user';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';

@Component({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppFiresideHostThumbIndicator extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	host!: FiresideRTCUser;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	get padding() {
		// Make a nice looking curve, have it snap to a small number of positions.
		const volumeAdjusted =
			Math.pow(Math.log10(this.host.volumeLevel * 100 + 1), 1.5) /
			Math.pow(Math.log10(101), 1.5);

		const accuracy = 7;
		const volumeSnapped = Math.round(volumeAdjusted * accuracy) / accuracy;
		// Doing either ceil or floor here will help with weird half-value
		// padding jank depending on the browser.
		const clamped = Math.ceil(Math.min(1, Math.max(0, volumeSnapped)) * 10);
		return `calc( max( ${clamped}px, ${clamped}% ))`;
	}
}
