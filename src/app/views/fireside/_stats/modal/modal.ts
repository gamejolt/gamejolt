import { Component, Prop, ProvideReactive } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../../components/fireside/controller/controller';
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
}
