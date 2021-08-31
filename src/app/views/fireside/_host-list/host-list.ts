import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { FiresideRTCProducer } from '../../../../_common/fireside/rtc/producer';
import { FiresideRTC, FiresideRTCKey } from '../../../../_common/fireside/rtc/rtc';
import AppFiresideHostThumb from '../_host-thumb/host-thumb.vue';
import AppFiresideStreamOptions from '../_stream-options/stream-options.vue';

@Component({
	components: {
		AppFiresideHostThumb,
		AppScrollScroller,
		AppFiresideStreamOptions,
	},
})
export default class AppFiresideHostList extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	hideThumbOptions!: boolean;

	@Prop({ type: FiresideRTCProducer, required: false })
	hostRtc?: FiresideRTCProducer;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}
}
