import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { FiresideController, FiresideControllerKey } from '../controller/controller';
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

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}
}
