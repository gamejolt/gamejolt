import { mixins, Options, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { RouteStatus } from '../../fireside';
import AppFiresideStats from '../stats.vue';

@Options({
	components: {
		AppFiresideStats,
	},
})
export default class AppFiresideStatsModal extends mixins(BaseModal) {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	@Prop({ type: String, required: true })
	status!: RouteStatus;

	@Prop({ type: Boolean, required: true })
	isStreaming!: boolean;
}
