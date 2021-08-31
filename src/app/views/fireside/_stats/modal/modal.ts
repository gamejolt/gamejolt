import { Component, Prop, ProvideReactive } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { RouteStatus } from '../../fireside';
import { FiresideRTCProducer } from '../../../../../_common/fireside/rtc/producer';
import { FiresideController, FiresideControllerKey } from '../../controller';
import AppFiresideStats from '../stats.vue';

@Component({
	components: {
		AppFiresideStats,
	},
})
export default class AppFiresideStatsModal extends BaseModal {
	@ProvideReactive(FiresideControllerKey)
	@Prop({ type: FiresideController, required: true })
	controller!: FiresideController;

	@Prop({ type: String, required: true })
	status!: RouteStatus;

	@Prop({ type: FiresideRTCProducer, required: false })
	hostRtc?: FiresideRTCProducer;

	@Prop({ type: Boolean, required: true })
	isStreaming!: boolean;
}
