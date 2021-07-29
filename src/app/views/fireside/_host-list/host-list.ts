import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import AppFiresideHostAvatar from '../_host-avatar/host-avatar.vue';

@Component({
	components: {
		AppFiresideHostAvatar,
		AppScrollScroller,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	scrollable!: boolean;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('change-host') emitChangeHost() {}
}
