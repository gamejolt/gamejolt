import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../../components/fireside/controller/controller';
import { CohostManageModal } from './manage-modal.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideCohostManage extends Vue {
	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	openManageModal() {
		CohostManageModal.show(this.c);
	}
}
