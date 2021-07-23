import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
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
	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;
	@Prop(propOptional(Boolean, false)) scrollable!: boolean;

	@Emit('change-host') emitChangeHost() {}
}
