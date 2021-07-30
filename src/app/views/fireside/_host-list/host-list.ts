import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';

@Component({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
	},
})
export default class AppFiresideHostList extends Vue {
	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('change-host') emitChangeHost() {}

	mounted() {
		this.rtc.thumbnailsVisible = true;
	}

	destroyed() {
		this.rtc.thumbnailsVisible = false;
	}
}
