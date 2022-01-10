import { Inject, Options, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../../components/fireside/controller/controller';
import { CohostManageModal } from './manage-modal.service';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideCohostManage extends Vue {
	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	openManageModal() {
		CohostManageModal.show(this.c);
	}
}
