import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../../_common/modal/base';
import AppModal from '../../../../../../_common/modal/modal.vue';
import AppProgressBar from '../../../../../../_common/progress/bar/bar.vue';
import { Halloween2019MonsterBreakdown } from '../../../../../../_common/user/user.model';

@Component({
	components: {
		AppModal,
		AppProgressBar,
	},
})
export default class AppHalloweenShellMonsterModal extends BaseModal {
	@Prop(String)
	avatar!: string;

	@Prop(Object)
	userBreakdown!: Halloween2019MonsterBreakdown;

	@Prop(Object)
	globalBreakdown!: Halloween2019MonsterBreakdown;

	@Prop(String)
	pun!: string;

	@Prop(String)
	mood!: string;
}
