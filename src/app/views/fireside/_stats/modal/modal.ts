import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { RouteStatus } from '../../fireside';
import AppFiresideStats from '../stats.vue';

@Component({
	components: {
		AppFiresideStats,
	},
})
export default class AppFiresideStatsModal extends BaseModal {
	@Prop(propRequired(Fireside)) fireside!: Fireside;
	@Prop(propRequired(String)) status!: RouteStatus;
}
